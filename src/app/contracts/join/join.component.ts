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
  contract: string = '';
  name: string = '';
  selectedProfile: any = '';
  public existingProfiles: any[] = [];
  isDisabled: boolean = true;
  invitation: string = "";

  constructor(
      private agentService: AgentService,
      private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  onInviteUpdate(value: string) {
    try {
      let json = JSON.parse(window.atob(value));
      this.address = json['address'];
      this.agent = json['agent'];
      this.contract = json['contract'];
      this.isDisabled = false;
    } catch {
      let config = new MatSnackBarConfig;
      config.duration = 2000;
      this.snackBar.open('invalid invitation','',config);
    }
  }
}
