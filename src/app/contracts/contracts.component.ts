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
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.server = decodeURIComponent(this.route.snapshot.paramMap.get('server') as string);
    this.agent = this.route.snapshot.paramMap.get('agent') as string;
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
      console.log('Dialog result:', result);
      if(result) {
        const link = {'address': this.server, 'agent': this.agent, 'profile': result.contract};
        const blob = new Blob([JSON.stringify(link, null, 2)], { type: "application/json",});
        var url = window.URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "my_id.json";
        anchor.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  openApp(contract: Contract) {
    let encodedServer = this.route.snapshot.paramMap.get('server') as string;
    let url = `${contract.default_app}/${encodedServer}/${this.agent}/${contract.id}`;
    console.log(url)
    window.open(url, "_blank");
  }

  log(obj: any) {
    console.log(obj);
  }

}
