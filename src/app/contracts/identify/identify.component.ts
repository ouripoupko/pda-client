import { Component } from '@angular/core';
import { Contract } from '../../contract';

@Component({
  selector: 'app-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.css']
})
export class IdentifyComponent {

  selectedContract: string = '';
  existingContracts: Contract[] = [];

  constructor(
  ) { }

  ngOnInit(): void {
  }

}
