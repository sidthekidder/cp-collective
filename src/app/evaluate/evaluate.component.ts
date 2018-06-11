import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';


@Component({
  selector: 'app-evaluate',
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.css']
})
export class EvaluateComponent implements OnInit, OnDestroy {

  private subEid: any

  constructor(private dataService: DataService, private route: ActivatedRoute) { 

  }

  ngOnInit() {
    let that = this
  }

  loadData() {
    let that = this
  }

  ngOnDestroy() {
    this.subEid.unsubscribe()
  }
}
