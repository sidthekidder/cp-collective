import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }      from './home/home.component';
import { DomainComponent }      from './domain/domain.component';
import { QuestionComponent }      from './question/question.component';
import { EvaluateComponent }      from './evaluate/evaluate.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'domains', component: DomainComponent },
  { path: 'domains/:subdomain', component: DomainComponent },
  { path: 'domains/:subdomain/questions', component: QuestionComponent },
  { path: 'domains/:subdomain/questions/:tid', component: QuestionComponent },
  { path: 'domains/:subdomain/evaluate', component: EvaluateComponent },
  { path: 'domains/:subdomain/evaluate/:eid', component: EvaluateComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
