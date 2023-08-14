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

  constructor(
    private route: ActivatedRoute,
    private agentService: AgentService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.server = params['server'];
      this.agent = params['agent'];
    });
    console.log('subscribe done?', this.server, this.agent);

    this.updateContracts();
    this.agentService.listen(this.server, this.agent).addEventListener('message', message => {
      if(message.data.length > 0) {
        this.updateContracts();
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

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        let contract = {} as Contract;
        contract.address = this.server;
        contract.pid = this.agent;
        contract.name = result.contractName;
        contract.protocol = result.protocol;
        contract.default_app = result.appLink;
        contract.contract = result.file.name;
        contract.profile = result.profile;
        contract.group = result.group;
        contract.threshold = result.threshold;
        console.log(contract, result);
        var reader = new FileReader();
        reader.onload = () => {
          contract.code = reader.result as string;
          this.agentService.addContract(this.server, this.agent, contract)
            .subscribe(_ => {
          });
        };
        reader.readAsText(result.file);
      }
    });
  }

  openJoin() {
    const dialogRef = this.dialog.open(JoinComponent);
    dialogRef.componentInstance.existingProfiles =
      this.dataSource.filter(contract => contract.contract == 'profile.py');

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      this.agentService.joinContract(this.server, this.agent, result.address,
                                     result.agent, result.contract, result.profile)
        .subscribe(_ => {
      });
    });
  }

  openID() {
    const dialogRef = this.dialog.open(IdentifyComponent);
    dialogRef.componentInstance.existingContracts =
      this.dataSource.filter(contract => contract.contract == 'profile.py');

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result modified:', result);
      if(result) {
        const link = {'address': this.server, 'agent': this.agent, 'profile': result.contract};
        // const blob = new Blob([JSON.stringify(link, null, 2)], { type: "application/json",});
        // var url = window.URL.createObjectURL(blob);
        // var anchor = document.createElement("a");
        // anchor.href = url;
        // anchor.download = "my_id.json";
        // anchor.click();
        // window.URL.revokeObjectURL(url);
        this.copyToClipboard(JSON.stringify(link));
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
