import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../data.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  state: number
  importPrivateKey: string

  constructor(private router: Router, public dataService: DataService) {
    this.state = 1
  }

  ngOnInit() {
    this.loadData()
    this.state = 1
    this.importPrivateKey = ''
    
    if (this.dataService.user.loggedIn == true) {
      this.router.navigate(['/', 'profile'])
    }
  }

  ngOnDestroy() {
    this.importPrivateKey = ''
    this.state = 1
  }

  loadData() {
    let that = this
  }

  setState(newState) {
    if (newState == 2) {
      this.dataService.newAccount().then(() => {
        this.state = newState
        return
      })
    } else {
      this.state = newState
    }
  }

  importPk() {
    // validate the private key
    if (this.importPrivateKey.length == 0) {
      alert("Private key can't be empty!")
      return
    }

    let that = this
    this.dataService.existingAccount(this.importPrivateKey).then(() => {
      that.router.navigate(['/', 'home'])
      return
    }).catch((e) => {
      alert('Error in importing private key!')
    })
  }
}
