import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ContractsComponent } from './contracts/contracts.component';

const routes: Routes = [
  { path: 'identify', component: LoginComponent },
  { path: 'contracts', component: ContractsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
