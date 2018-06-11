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

  constructor(private router: Router, public dataService: DataService) {
    this.state = 1
  }

  ngOnInit() {
    this.loadData()
  }

  ngOnDestroy() {
  }

  loadData() {
    let that = this
  }

  setState(newState) {
    if (newState == 2) {
      console.log('calling newaccount')
      this.dataService.newAccount().then(() => {
        this.state = newState
        return
      })
    } else {
      this.state = newState
    }
  }
}
