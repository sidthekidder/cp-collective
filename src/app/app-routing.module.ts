import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ColonyComponent } from './colony/colony.component';
import { QuestionComponent } from './question/question.component';
import { ProfileComponent } from './profile/profile.component';
import { NewComponent } from './new/new.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'colony/:colony', component: ColonyComponent },
  { path: 'colony/:colony/:domain', component: ColonyComponent },
  { path: 'colony/:colony/:domain/question/:qid', component: QuestionComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'new', component: NewComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
