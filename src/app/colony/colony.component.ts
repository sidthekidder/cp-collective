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

    this.dataService.connectToColony(this.colonyName).then(() => {
      return
    })
  }

  ngOnDestroy() {
    this.subColonyName.unsubscribe()
  }

  domainLoop() {
    console.log('datas domainc is ' + this.dataService.domainCount)
    var list = []
    for(var i = 0 ; i < this.dataService.domainCount ; i++) list.push(i)
    console.log(list)
    return list
  }

  getTasks(type) {
    var list = []

    for(var i = 0 ; i < this.dataService.tasks.length ; i++) {
      let item = this.dataService.tasks[i]
      if (item.domainId == Constants.domainNameToIdMapping[this.colonyName][this.domainName]) {

        if (type == 1) {

        } else if (type == 2) {

        } else if (type == 3) {
          if (item.finalized) 
            list.push(item)
        }
        list.push(item)
      }
    }

    return list
  }
}
