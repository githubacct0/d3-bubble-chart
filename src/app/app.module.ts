import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { D3Service } from 'd3-ng2-service';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import {
  NgbActiveModal,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';

import { FlareJsonService } from './services/flare-json.service';
@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpModule,
    FontAwesomeModule,
    NgbModule,
    ModalModule.forRoot(),
  ],
  providers: [D3Service, FlareJsonService],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {}
