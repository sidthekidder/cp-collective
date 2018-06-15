// Copyright (c) 2018 Zilliqa 
// This source code is being disclosed to you solely for the purpose of your participation in 
// testing Zilliqa. You may view, compile and run the code for that purpose and pursuant to 
// the protocols and algorithms that are programmed into, and intended by, the code. You may 
// not do anything else with the code without express permission from Zilliqa Research Pte. Ltd., 
// including modifying or publishing the code (or any part of it), and developing or forming 
// another public or private blockchain network. This source code is provided ‘as is’ and no 
// warranties are given as to title or non-infringement, merchantability or fitness for purpose 
// and, to the extent permitted by law, all liability for your use of the code is disclaimed. 


import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';
import * as $ from 'jquery';


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, OnDestroy {

  colonyName: string
  domainName: string
  qid: string

  task: any
  modal: any
  submit: any

  private subColony: any
  private subDomain: any
  private subQid: any

  constructor(public dataService: DataService, private route: ActivatedRoute) { 
    this.task = {}
    this.resetModal()
  }

  ngOnInit() {
    let that = this

    this.subColony = this.route.params.subscribe(params => {
      that.colonyName = params.colony
    })
    this.subDomain = this.route.params.subscribe(params => {
      that.domainName = params.domain
    })
    this.subQid = this.route.params.subscribe(params => {
      that.qid = params.qid  // this is the task id
    })

    this.loadData()
  }

  loadData() {
    let that = this

    this.dataService.connectToColony(this.colonyName).then(() => {
      // get the task with id == qid
      for(var i = 0 ; i < that.dataService.tasks.length ; i++) {
        if (that.dataService.tasks[i].id == that.qid) {
          that.task = that.dataService.tasks[i]
        }
      }
    })
  }

  ngOnDestroy() {
    this.subColony.unsubscribe()
    this.subDomain.unsubscribe()
    this.subQid.unsubscribe()
    
    this.task = {}
    this.resetModal()
  }

  resetModal() {
    this.modal = {
      'apply': {'solve': false, 'evaluate': false, 'solveSuccess': false, 'evaluateSuccess': false, 'error': false},
      'submit': {'solve': false, 'evaluate': false,  'solveSuccess': false, 'evaluateSuccess': false, 'error': false}
    }
    this.submit = {
      url: '',
      rating: {
        evaluate: null,
        submit: null
      }
    }
  }

  closeModal() {
    this.resetModal()
  }

  applySolve() {
    this.modal.apply.solve = true
    $("#applyModalButton").click()
  }

  applyEvaluate() {
    this.modal.apply.evaluate = true
    $("#applyModalButton").click()
  }

  applySolveConfirm() {
    let that = this

    this.dataService.assignTask(this.task.id).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.apply.error = true
      } else {
        that.modal.apply.solveSuccess = true

        // temporary fix for UI
        that.task.worker = that.dataService.user.wallet.address
      }
    })
  }

  applyEvaluationConfirm() {
    let that = this

    this.dataService.assignEvaluate(this.task.id).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.apply.error = true
      } else {
        that.modal.apply.evaluateSuccess = true

        // temporary fix for UI
        that.task.evaluator = that.dataService.user.wallet.address
      }
    })
  }

  submitQuestion() {
    this.modal.submit.solve = true
    $("#submitModalButton").click()
  }

  submitEvaluation() {
    this.modal.submit.evaluate = true
    $("#submitModalButton").click()    
  }

  submitQuestionConfirm() {
    let that = this

    this.dataService.submitTask(this.task.id, this.submit.rating.url).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.submit.error = true
      } else {
        that.modal.submit.solveSuccess = true

        // temporary fix for UI
        that.task.finalized = true
      }
    })
  }

  submitEvaluationConfirm() {
    let that = this

    this.dataService.submitEvaluation(this.task.id, this.submit.rating.evaluate).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.submit.error = true
      } else {
        that.modal.submit.evaluateSuccess = true

        // temporary fix for UI
        that.task.finalized = true
      }
    })
  }
}
