import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  constructor(private dataService: DataService, private route: ActivatedRoute) { 

  }

  ngOnInit() {
    let that = this
    // this.loadData()
  }

  loadData() {
    let that = this
  }

  ngOnDestroy() {
  }
}
