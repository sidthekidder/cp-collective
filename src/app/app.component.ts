import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';

import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public router: Router, public dataService: DataService) {

  }

  ngOnInit() {
    let that = this
  }
}
