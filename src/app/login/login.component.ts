import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { AgentService } from '../agent.service';
import { RegisterComponent } from './register/register.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  currentInput: any;
  key = 'no key loaded yet';
  selectedServer: string = "";
  constructor(
    private router: Router,
    private agentService: AgentService,
    public dialog: MatDialog
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
        this.key = json['public']['n'];
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  onLogin(event: any) {
    this.agentService.isExistAgent(this.selectedServer, this.key).subscribe((exists: Boolean) => {
      console.log(this.key, this.selectedServer, exists);
      if (exists) {
        this.router.navigate([`contracts/${encodeURIComponent(this.selectedServer)}/${this.key}`]);
      }
      else {
        const dialogRef = this.dialog.open(RegisterComponent);

        dialogRef.afterClosed().subscribe((result: Boolean) => {
          if (result) {
            this.agentService.registerAgent(this.selectedServer, this.key).subscribe((succeed: Boolean) => {
              if(succeed) {
                this.router.navigate([`contracts/${encodeURIComponent(this.selectedServer)}/${this.key}`]);
              }
            });
          }
        });
      }
    });
  }

  async onGenerate(event: any) {
    let key = await window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true,
      ["sign", "verify"]
    );
    const publicKey = await window.crypto.subtle.exportKey(
      "jwk",
      key.publicKey
    );
    const privateKey = await window.crypto.subtle.exportKey(
      "jwk",
      key.privateKey
    );
    const pair = {'public': publicKey, 'private': privateKey};
    const blob = new Blob([JSON.stringify(pair, null, 2)], { type: "application/json",});
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "my_key.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
