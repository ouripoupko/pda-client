import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Contract } from '../contract';
import { AgentService } from '../agent.service';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DeployComponent } from './deploy/deploy.component';
import { JoinComponent } from './join/join.component';
import { IdentifyComponent } from './identify/identify.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Subject, first } from 'rxjs';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})
export class ContractsComponent implements OnInit {

  @ViewChild(MatTable) table!: MatTable<any>;
  displayedColumns: string[] = ['name', 'contract', 'protocol', 'expand'];
  dataSource: Contract[] = [];
  clickedRow: string = "";
  expandedElement: any;
  server = "";
  agent = "";
  serverSide = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private agentService: AgentService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.server = params['server'];
      this.agent = params['agent'];

      this.updateContracts();
    });

    this.agentService.listen(this.server, this.agent).addEventListener('message', message => {
      if(message.data.length > 0) {
        this.updateContracts();
        this.serverSide.next();
      }
    });
  }

  updateContracts() {
    this.agentService.getContracts(this.server, this.agent)
      .subscribe((contracts:Contract[]) => {
        this.dataSource = [];
        for (let contract of contracts) {
          this.dataSource.push(contract);
        }
        this.table.renderRows();
      });
  }

  openDeploy() {
    const dialogRef = this.dialog.open(DeployComponent);
    dialogRef.componentInstance.existingProfiles =
      this.dataSource.filter(contract => contract.contract == 'profile.py');
    dialogRef.componentInstance.existingCommunities =
      this.dataSource.filter(contract => contract.contract == 'community.py');

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        let details = result.contract;
        let contract = {} as Contract;

        contract.name = result.name;
        contract.contract = details.file;
        contract.code = "";
        contract.protocol = result.protocol;
        contract.default_app = details.applink;
        contract.pid = this.agent;
        contract.address = this.server;

        contract.group = result.group;
        contract.threshold = result.threshold;
        contract.profile = result.profile;

        contract.constructor = result.community ? {community: result.community} : {};

        this.httpClient.get(`assets/${details.file}`, { responseType: 'text' })
          .subscribe(data => {
            contract.code = data;
            console.log(contract, result);
            this.agentService.addContract(this.server, this.agent, contract)
              .subscribe(_ => {
            });
        });
      }
    });
  }

  openJoin() {
    const dialogRef = this.dialog.open(JoinComponent);
    dialogRef.componentInstance.existingProfiles =
      this.dataSource.filter(contract => contract.contract == 'profile.py');

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      if(result) {
        this.agentService.joinContract(this.server, this.agent, result.address,
                                      result.agent, result.contract, result.profile)
          .subscribe(reply => {
            this.serverSide.pipe(
              // this is not good enough. I should check the reply untill I see a direct response
              // and only then unsubscribe. But I am tired to do this now.
              first()
            ).subscribe(_ => {
              this.agentService.getReply(this.server, this.agent, reply['reply']).subscribe((message: any) => {
                if('status' in message && message['status'] == false) {
                  this.snackBar.open('Unauthorized to join contract', '', {
                    duration: 2000
                  });
                }
              });
            });
        });
      }
    });
  }

  openID() {
    const dialogRef = this.dialog.open(IdentifyComponent);
    dialogRef.componentInstance.existingContracts =
      this.dataSource;

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result modified:', result);
      if(result) {
        const link = {'address': this.server, 'agent': this.agent, 'contract': result.contract};
        // pad with spaces to avoid '=' chars in the base64
        let str = JSON.stringify(link);
        str += ' '.repeat(3-(str.length%3));
        this.copyToClipboard(window.btoa(str));
      }
    });
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.showSuccess();
        })
        .catch((error) => {
          this.execCommandFallback(text);
        });
    } else {
      this.execCommandFallback(text);
    }
  }

  execCommandFallback(text: string): void {
    const copyText = document.createElement('textarea');
    copyText.style.position = 'absolute';
    copyText.style.left = '-99999px';
    copyText.style.top = '0';
    copyText.value = text;
    document.body.appendChild(copyText);
    copyText.focus();
    copyText.select();
    try {
      if (document.execCommand('copy')) {
        this.showSuccess();
      } else {
        this.manualCopyFallback(text);
      }
    } catch (error) {
      this.manualCopyFallback(text);
    } finally {
      document.body.removeChild(copyText);
    }
  }

  manualCopyFallback(text: string): void {
    prompt('Please copy the following text:', text);
  }

  showSuccess(): void {
    this.snackBar.open('Text copied to clipboard successfully', '', {
      duration: 2000
    });
  }
  
  openApp(contract: Contract) {
    // let encodedServer = this.route.snapshot.paramMap.get('server') as string;
    // let old_url = `${contract.default_app}/${encodedServer}/${this.agent}/${contract.id}`;
    // console.log(old_url)
    const url = new URL(contract.default_app);
    url.searchParams.append("server", this.server);
    url.searchParams.append("agent", this.agent);
    url.searchParams.append("contract", contract.id);

    window.open(url, "_blank");
  }

  log(obj: any) {
    console.log(obj);
  }

}
