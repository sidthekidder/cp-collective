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

    // get the colony name, domain name, and task id from the URL
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

    this.dataService.connectToColony(this.colonyName, false).then(() => {
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
    // call the setTaskRole API
    let that = this

    this.dataService.assignTask(this.task.id).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.apply.error = true
      } else {
        that.modal.apply.solveSuccess = true

        // fix UI to prevent reload
        that.task.worker = that.dataService.user.wallet.address
      }
    })
  }

  applyEvaluationConfirm() {
    // call the setTaskRole API
    let that = this

    this.dataService.assignEvaluate(this.task.id).then((data) => {
      that.resetModal()
      if (data.success != true) {
        that.modal.apply.error = true
      } else {
        that.modal.apply.evaluateSuccess = true

        // fix UI to prevent reload
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
    // call the submitTaskDeliverable API
    let that = this

    this.dataService.submitTask(this.task.id, this.submit.rating.url).then((data) => {
      that.resetModal()

      that.dataService.networkLoading = false
      if (data.success != true) {
        that.modal.submit.error = true
      } else {
        that.modal.submit.solveSuccess = true

        // temp fix for UI to prevent reload
        that.finalizeTask(that.task.id)
      }
    }).catch((e) => {
      console.log('Error!')
      console.log(e)
      that.dataService.networkLoading = false

      that.modal.submit.error = true
    })
  }

  submitEvaluationConfirm() {
    let that = this

    this.dataService.submitEvaluation(this.task.id, this.submit.rating.evaluate).then((data) => {
      that.resetModal()
      that.dataService.networkLoading = false
      if (data.success != true) {
        that.modal.submit.error = true
      } else {
        that.modal.submit.evaluateSuccess = true

        // prevent UI reload
        that.finalizeTask(that.task.id)
      }
    }).catch((e) => {
      console.log('Error!')
      console.log(e)
      that.dataService.networkLoading = false

      // temp hack till the submitTaskRating API works
      // that.modal.submit.error = true
      that.modal.submit.solveSuccess = true
      that.finalizeTask(that.task.id)
    })
  }

  finalizeTask(tid) {
    let i = this.dataService.tasks.findIndex(item => item.id === tid)
    if (i == -1) return
    this.dataService.tasks[i].finalized = true  
  }
}
