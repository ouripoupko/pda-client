import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent implements OnInit {

  file!: File;
  contractName = '';
  selectedProtocol = '';
  appLink = '';
  selectedProfile: any = '';
  public existingProfiles: any[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  onFileSelected(event: any) {
    if(event.target.files.length > 0)
    {
      this.file = event.target.files[0];
    }
  }
}
