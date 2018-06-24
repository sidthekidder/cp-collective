import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import { Constants } from '../constants';
import * as $ from 'jquery';


@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit, OnDestroy {

  // 1 - enter details, 2 - successful creation, 3 - unsuccessful creation
  state: number

  colonies: any
  domains: any

  task: any

  constructor(public dataService: DataService, private route: ActivatedRoute) { 
    this.state = 1
    this.colonies = []
    this.domains = {}
  }

  ngOnInit() {
    let that = this

    this.loadData()
  }

  loadData() {
    let that = this
        
    this.task = {'title': '', 'description': '', 'colony': '', 'domain': ''}

    // get all colonies
    let data = Constants.domainNameToIdMapping
    Object.keys(data).forEach((key) => {
      that.colonies.push(key)
    })

    // build an object with each domain for each colony
    for(var i = 0 ; i < this.colonies.length ; i++) {
      let colonyName = this.colonies[i]
      that.domains[colonyName] = []
      Object.keys(data[colonyName]).forEach((key) => that.domains[colonyName].push(key))
    }
  }

  ngOnDestroy() {
    this.task = {'title': '', 'description': '', 'colony': '', 'domain': ''}
  }

  setState(newState) {
    this.task = {'title': '', 'description': '', 'colony': '', 'domain': ''}
    this.state = newState
  }

  createTask() {
    let that = this

    if (this.task.title.length == 0 || 
        this.task.description.length == 0 || 
        this.task.colony.length == 0 || 
        this.task.domain.length == 0) {
      alert('Please enter the fields correctly')
      return
    }

    this.dataService.createTask(this.task).then((data) => {
      console.log('got back')
      console.log(data)
      if (data.success == true) {
        that.setState(2)
      } else {
        that.setState(3)
      }
    }).catch((e) => {
      that.setState(3)
    })
  }
}
