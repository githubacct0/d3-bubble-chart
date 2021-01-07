import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { HttpModule } from '@angular/http';
import { D3Service } from 'd3-ng2-service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap';
import { NgbActiveModal, NgbModal,NgbModule } from '@ng-bootstrap/ng-bootstrap';

import  { FlareJsonService } from "./services/flare-json.service";
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent        
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpModule,
    FontAwesomeModule,
    NgbModule,
    ModalModule.forRoot()
    
  
  ],
  providers: [D3Service , FlareJsonService],
  bootstrap: [AppComponent],
  entryComponents:[]
})
export class AppModule { }
