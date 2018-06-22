import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import { Constants } from '../constants';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  constructor(public dataService: DataService, private route: ActivatedRoute, public router: Router) { 

  }

  ngOnInit() {
    let that = this
  }

  loadData() {
    let that = this

    this.dataService.connectToColonyMultiple().then(() => {
      return
    })
  }

  ngOnDestroy() {
  }

  getTasks() {
    var list = []

    // loop over all tasks in the colony
    for(var i = 0 ; i < this.dataService.tasks.length ; i++) {
      let task = this.dataService.tasks[i]
      // task with worker as user's own address
      if(task.worker == this.dataService.user.wallet.address) list.push(task)
    }

    return list
  }

  getEvaluations() {
    var list = []

    // loop over all tasks in the colony
    for(var i = 0 ; i < this.dataService.tasks.length ; i++) {
      let task = this.dataService.tasks[i]
      // task with evaluator as user's own address
      if(task.evaluator == this.dataService.user.wallet.address) list.push(task)
    }

    return list
  }
}
