import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';

import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { ContractsComponent } from './contracts/contracts.component';
import { JoinComponent } from './contracts/join/join.component';
import { DeployComponent } from './contracts/deploy/deploy.component';
import { RegisterComponent } from './login/register/register.component';
import { IdentifyComponent } from './contracts/identify/identify.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ContractsComponent,
    JoinComponent,
    DeployComponent,
    RegisterComponent,
    IdentifyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    HighlightModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSnackBarModule,
    MatSliderModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
//        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          python: () => import('highlight.js/lib/languages/python')
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
