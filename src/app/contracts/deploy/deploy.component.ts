import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent implements OnInit {

  contractDetails = {};
  contractName = '';
  selectedProtocol = '';
  selectedProfile: any = '';
  public existingProfiles: any[] = [];
  inviteField: string = '';
  partners: string[] = [];
  threshold = 0;

  constructor() { }

  ngOnInit(): void {
    this.selectedProtocol = 'BFT';
  }

  onInviteUpdate() {
    this.partners.push(this.inviteField);
    this.inviteField = '';
  }
}
