import { Component, OnInit } from '@angular/core';

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

  constructor() { }

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
        this.contract = json['contract'];
        this.name = event.target.files[0].name;
      };
      reader.readAsText(event.target.files[0]);
    }
  }

}
