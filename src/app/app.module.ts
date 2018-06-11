import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DomainComponent } from './domain/domain.component';
import { QuestionComponent } from './question/question.component';
import { EvaluateComponent } from './evaluate/evaluate.component';
import { ProfileComponent } from './profile/profile.component';
import { Constants} from './constants';
import { DataService } from './data.service';
import { AppRoutingModule } from './app-routing.module';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DomainComponent,
    QuestionComponent,
    EvaluateComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
