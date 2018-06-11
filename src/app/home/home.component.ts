import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../data.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private router: Router, public dataService: DataService) {
  }

  ngOnInit() {
    this.loadData()
  }

  ngOnDestroy() {
  }

  loadData() {
    let that = this
  }
}
