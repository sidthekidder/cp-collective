import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import { Constants } from '../constants';


@Component({
  selector: 'app-colony',
  templateUrl: './colony.component.html',
  styleUrls: ['./colony.component.css']
})
export class ColonyComponent implements OnInit, OnDestroy {

  // state is 1 if viewing overall colony
  // state is 2 if viewing specific domain
  state: number
  colonyToDomainMapping: any

  colonyName: string
  private subColonyName: any

  domainName: string
  private subDomainName: any

  constructor(public dataService: DataService, private route: ActivatedRoute) {
    this.state = 1
    this.colonyToDomainMapping = Constants.colonyToDomainMapping
  }

  ngOnInit() {
    let that = this

    // get the colony and (if present) domain names from the URL
    this.subColonyName = this.route.params.subscribe(params => {
      that.colonyName = params.colony

      that.loadColonyData().then(() => {
        that.subDomainName = that.route.params.subscribe(params => {
          that.domainName = params.domain

          if (that.domainName != undefined) {
            that.state = 2
          }
        })
      })
    })
  }

  async loadColonyData() {
    let that = this

    this.dataService.connectToColony(this.colonyName, false).then(() => {
      return
    })
  }

  ngOnDestroy() {
    this.subColonyName.unsubscribe()
  }

  domainLoop() {
    var list = []
    // we loop over 2 - (domainCount-1) because that's how domainId is counted, from root (1) onwards
    for(var i = 2 ; i <= this.dataService.domainCount ; i++) list.push(i)
    return list
  }

  getTasks(type) {
    var list = []

    // loop over all tasks in the colony
    for(var i = 0 ; i < this.dataService.tasks.length ; i++) {
      let task = this.dataService.tasks[i]
      // check if domainID of task same as the current domainID
      if (task.domainId == Constants.domainNameToIdMapping[this.colonyName][this.domainName]) {
        switch(type) {
          case 1:  // task without any worker assigned
            if (task.worker == null) list.push(task)
            break
          case 2:  // task without any evaluator assigned
            if (task.evaluator == null) list.push(task)
            break
          case 3:  // completed task
            if (task.finalized) list.push(task)
            break
        }
      }
    }

    return list
  }
}
