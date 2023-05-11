import { Component, OnInit } from '@angular/core';
import { Contract } from '../../contract';
import { AgentService } from '../../agent.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  address: string = '';
  agent: string = '';
  contractInvite: string = '';
  selectedContract: string = '';
  name: string = '';
  selectedProfile: any = '';
  public existingProfiles: any[] = [];

  existingContracts: Contract[] = [];

  constructor(
      private agentService: AgentService,
      private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any) {
    if(event.target.files.length > 0)
    {
      var reader = new FileReader();
      reader.onload = () => {
        var text = reader.result as string;
        var json = JSON.parse(text);
        this.address = json['address'];
        this.agent = json['agent'];
        this.name = event.target.files[0].name;
        this.agentService.getContracts(this.address, this.agent)
          .subscribe((contracts:Contract[]) => {
            this.existingContracts = contracts;
          });
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  onInviteUpdate() {
    try {
      let json = JSON.parse(this.contractInvite);
      this.address = json['address'];
      this.agent = json['agent'];
      this.agentService.getContracts(this.address, this.agent)
        .subscribe((contracts:Contract[]) => {
          this.existingContracts = contracts;
        });
    } catch {
      let config = new MatSnackBarConfig;
      config.duration = 2000;
      this.snackBar.open('invalid invitation','',config);
    }
  }
}
