import { Component, OnInit } from '@angular/core';
import { Contract } from 'src/app/contract';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent implements OnInit {

  contractType = '';
  contractName = '';
  selectedProtocol = '';
  selectedProfile: any = '';
  public existingProfiles: Contract[] = [];
  selectedCommunity: string = '';
  public existingCommunities: Contract[] = [];
  inviteField: string = '';
  partners: string[] = [];
  threshold = 0;
  contractDetails: {[name: string]: any} = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.contractDetails = {
      "profile": {"file": "profile.py", "applink": location.origin + "/profile"},
      "community": {"file": "community.py", "applink": location.origin + "/community"},
      "social": {"file": "sn_person.py", "applink": location.origin + "/social"},
      "deliberation": {"file": "delib.py", "applink": location.origin + "/delib"}};
    this.selectedProtocol = 'BFT';
  }

  onInviteUpdate() {
    this.partners.push(this.inviteField);
    this.inviteField = '';
  }

  getContractDetails() {
    return (this.contractType in this.contractDetails) ? this.contractDetails[this.contractType] : {};
  }
}
