import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';


@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit, OnDestroy {

  private subDomain: any

  constructor(public dataService: DataService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    let that = this

    this.subDomain = this.route.params.subscribe(params => {
    })
  }

  loadData() {
    let that = this
  }

  ngOnDestroy() {
    this.subDomain.unsubscribe()
  }
}
