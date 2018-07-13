import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as $ from 'jquery';
import EthersAdapter from '@colony/colony-js-adapter-ethers';
import ColonyNetworkClient from '@colony/colony-js-client';
import { Constants} from './constants'
import { v4 as uuid } from 'uuid';
import * as BN from 'bn.js';

import { providers, Wallet } from 'ethers';

import { TrufflepigLoader } from '@colony/colony-js-contract-loader-http';
import { environment } from '../environments/environment';

declare const Buffer
declare var Ipfs

@Injectable()
export class DataService {

  networkLoading: boolean
  // stores the currently signed in user
  user: any
  // stores the admin user (for multi-sig and admin operations)
  admin: any
  // used for keeping track of 'new' account signups which are actually from the sample ganache-accounts.json
  accountCount: number

  // colonyjs variables
  loader: any
  provider: any
  // the meta client and colony client for currently viewing user
  // automatically allocated even if not signed in, since they are required to view domains/tasks
  colonyNetworkClient: any
  colonyClient: any
  // the meta client and colony client for admin user in the background (insecure hack)
  adminColonyNetworkClient: any
  adminColonyClient: any
  // stores the ipfs node
  node: any

  // number of domains = last created domainId in that colony
  domainCount: number
  // list of domains in the current colony
  domains: Array<any>
  // number of tasks = last created taskId in that domain
  taskCount: number  
  // list of tasks in the current colony
  tasks: Array<any>

  constructor(private http: HttpClient) {
    this.networkLoading = false

    // initialize data
    this.taskCount = 0
    this.domainCount = 0
    this.tasks = []
    this.domains = []
    this.accountCount = 1

    // create the user and admin object
    this.user = {
      'loggedIn': false
    }
    this.admin = { }


    this.initLib()
  }

  initLib() {
    let that = this

    // create an instance of the Trufflepig contract loader
    this.loader = new TrufflepigLoader();

    // create a provider for local TestRPC (Ganache)
    this.provider = new providers.JsonRpcProvider('http://localhost:8545')

    // create a demo background(hidden) account to view ColonyNetwork data
    // this will not create a proper user account - for that the user must generate a new account
    // if the user chooses to import his own private key, this wallet will be overwritten
    // this hidden background account is needed to connect to any colony at all

    // get the private key from the first account from the ganache-accounts through trufflepig
    this.loader.getAccount(0).then((data) => {
      const privateKey = data.privateKey

      // create a wallet with the private key
      that.user.wallet = new Wallet(privateKey, that.provider)
      that.admin.wallet = that.user.wallet

      // create an adapter (powered by ethers)
      const adapter = new EthersAdapter({
        loader: that.loader,
        provider: that.provider,
        wallet: that.user.wallet,
      })

      // connect to ColonyNetwork with that adapter
      that.colonyNetworkClient = new ColonyNetworkClient({ adapter })

      // store this secret background connection for admin powers - signing multi-sig tasks, creating tasks
      that.adminColonyNetworkClient = new ColonyNetworkClient({ adapter })

      // init the user and admin clients as well as IPFS
      that.colonyNetworkClient.init().then(() => {
        that.adminColonyNetworkClient.init().then(() => {
          that.initIPFS().then(() => { })
          that.networkLoading = false
        })
      })
    })
  }

  resetAccount() {
    // flush the logged in users
    this.user.wallet = {}
    this.user.loggedIn = false
  }

  async newAccount() {
    // cet the private key from the 'accountCount'th account from ganache-accounts sample json
    const { privateKey } = await this.loader.getAccount(this.accountCount++)

    // create a wallet with the private key
    this.user.wallet = new Wallet(privateKey, this.provider)

    // create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader: this.loader,
      provider: this.provider,
      wallet: this.user.wallet,
    })

    // connect to ColonyNetwork and init the connection
    this.colonyNetworkClient = new ColonyNetworkClient({ adapter })
    await this.colonyNetworkClient.init()

    // set user loggedIn variable to true, to expose logged in functionality
    this.user.loggedIn = true
  }

  async existingAccount(privateKey) {
    // create a wallet with the given private key
    this.user.wallet = new Wallet(privateKey, this.provider)
    
    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader: this.loader,
      provider: this.provider,
      wallet: this.user.wallet,
    })

    // connect to ColonyNetwork and init the connection
    this.colonyNetworkClient = new ColonyNetworkClient({ adapter })
    await this.colonyNetworkClient.init()

    this.user.loggedIn = true
  }


  logOut() {
    // flush away user properties
    this.user = {
      'loggedIn': false,
      'wallet': {}
    }
  }

  async connectToColony(colonyName, forceConnect) {
    // forceConnect indicates if colonyClient data should be reloaded
    // true in case of new Task, because we should be able to connect to any colony when we are creating the task
    // false in other cases, as we don't want to reload colony data while navigating inside a colony
    // this is only undefined when we go from Homepage into a Colony
    if (!forceConnect && this.colonyClient != undefined) {
      return
    }
    console.log('Connecting to colony: ' + colonyName)

    // get the colony ID from colony name using generated Constants mapping
    const colonyId = Constants.colonyNameToIdMapping[colonyName]

    // wait for the clients to be initialized in initLib()
    // to make sure that all data is loaded even if this is the first page opened (without navigating from homepage)
    while (this.colonyNetworkClient == undefined || this.adminColonyNetworkClient == undefined) {
      await this.sleep(500)
    }

    // for a colony that exists already, you just need its ID:
    this.colonyClient = await this.colonyNetworkClient.getColonyClient(colonyId);
    // keep admin updated too
    this.adminColonyClient = await this.adminColonyNetworkClient.getColonyClient(colonyId);

    this.clearColonyData()

    // finally get the relevant data
    await this.getColonyData(colonyName)
    return
  }

  async connectToColonyMultiple() {
    // used to connect to multiple colonies when we go to a user's profile page
    // because a user may have tasks pending in different colonies
    // so no choice but to check all of them
    let that = this

    while (this.colonyNetworkClient == undefined) {
      await this.sleep(500)
    }

    // loop through all colonies and get the data for each one
    Object.keys(Constants.colonyNameToIdMapping).forEach((key) => {
      let cid = Constants.colonyNameToIdMapping[key]
      this.colonyNetworkClient.getColonyClient(cid).then((data) => {
        that.colonyClient = data
        that.getColonyData(key)
      })
    })
    return
  }

  clearColonyData() {
    this.domains = []
    this.tasks = []
  }

  async getColonyData(colonyName) {
    // wait for colonyClient to initialize (if we directly load a page)
    while (this.colonyClient == undefined) {
      await this.sleep(500)
    }

    // get the number of domains and tasks
    let dc = await this.colonyClient.getDomainCount.call()
    this.domainCount = dc.count
    let tc = await this.colonyClient.getTaskCount.call()
    this.taskCount = tc.count

    // get details of each domain
    for(var i = 0 ; i < this.domainCount ; i++) {
      let obj = await this.colonyClient.getDomain.call({domainId: i})
      this.domains.push(obj)
    }

    // get details of each task + pull data from IFPS as well
    for(var j = 1; j <= this.taskCount ; j++) {
      console.log('starting task ' + j)
      try {
        let task = await this.colonyClient.getTask.call({taskId: j})
        if (task.specificationHash == null) {
          // if spec hash is empty then it's a unknown task so just skip it for now
          this.taskCount += 1
          continue
        }
        // get IPFS details using ECP
        let taskDetails = await this.getTaskSpecification(task.specificationHash)
        task['details'] = taskDetails

        // get role open/closed details for each task - to know if it's open for submission/evaluation
        let taskWorker = await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'WORKER' })
        let taskEvaluator = await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'EVALUATOR' })
        task['worker'] = (taskWorker.address != null)? taskWorker.address : null
        task['evaluator'] = (taskEvaluator.address != null)? taskEvaluator.address : null

        // save the colony name and domain name for easy reference
        task['colonyName'] = colonyName
        task['domainName'] = Constants.colonyToDomainMapping[colonyName][task.domainId].slug
        
        this.tasks.push(task)
      } catch (e) {
        console.log("Error in retrieving task: " + e)
        continue
      }
    }
    console.log('Retrieved tasks: ' + JSON.stringify(this.tasks))
    return
  }

  async assignTask(tid) {
    // assign a task with id tid to the current logged in user using admin connection
    this.startLoading()

    let cResponse = await this.adminColonyClient.setTaskRoleUser.send({
      taskId: tid,
      role: 'WORKER',
      user: this.user.wallet.address
    })

    // set the due date in the future
    // uses multi-sig to sign for both admin(manager) and current user, and make it immediately active
    var op = await this.colonyClient.setTaskDueDate.startOperation({
      taskId: tid,
      dueDate: new Date(2020, 1, 1)
    })

    // sign with the worker
    await op.sign()

    // now sign with the manager
    var json = op.toJSON()
    var opAdmin = await this.adminColonyClient.setTaskDueDate.restoreOperation(json);
    await opAdmin.sign()

    // finally send the multi-sig op
    const { successful } = await opAdmin.send()
    console.log('Due date for task set: ' + successful)

    this.endLoading()
    return { success: successful }
  }

  async assignEvaluate(tid) {
    // assign a task with id tid to the current logged in user using admin connection
    // no multi-sig needed here
    this.startLoading()

    let cResponse = await this.adminColonyClient.setTaskRoleUser.send({
      taskId: tid,
      role: 'EVALUATOR',
      user: this.user.wallet.address
    })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async createTask(task) {
    // create a task using admin connection
    let that = this

    this.startLoading()

    // connect to the relevant colony first
    await this.connectToColony(task.colony, true)

    // create the ipfs task specification
    const specificationHash = await this.saveTaskSpecification({ title: task.title, description: task.description })
    // get the domain ID
    let domainId = Constants.domainNameToIdMapping[task.colony][task.domain]
    
    // create the task on colony
    let cResponse = await this.adminColonyClient.createTask.send({ specificationHash: specificationHash, domainId: domainId })
    this.endLoading()

    if (cResponse.successful) {
      // add the task locally so we don't have to refetch all data
      let tid = cResponse.eventData.taskId
      let newTask = await this.colonyClient.getTask.call({taskId: tid})
      newTask['worker'] = null
      newTask['evaluator'] = null
      newTask['colonyName'] = task.colony
      newTask['domainName'] = task.domain
      newTask['details'] = {
        'name': task.name,
        'description': task.description
      }

      that.tasks.push(newTask)

      // disconnect from the colony client so that on navigating later the data is reloaded
      that.colonyClient = undefined
      return {success: true}
    } else {
      // disconnect from the colony client so that on navigating later the data is reloaded
      that.colonyClient = undefined
      return {success: false}
    }
  }

  async submitTask(tid, url) {
    // submit the task using the currently logged in user's connection
    // store the URL in IPFS using ECP
    this.startLoading()

    const deliverableHash = await this.saveTaskSpecification({ url: url });

    let cResponse = await this.colonyClient.submitTaskDeliverable.send({
      taskId: tid,
      deliverableHash: deliverableHash,
    })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitTaskRating(tid, rating) {
    // submit the final rating by the evaluator
    // todo - get the API working
    // this.startLoading()

    let salt = uuid()
    let val = new BN(rating, 10)

    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: val
    })

    let cResponse = {successful: true} /*await this.colonyClient.submitTaskWorkRating.send({
      taskId: tid,
      role: 'WORKER',
      ratingSecret: ratingSecret.secret,
    })*/

    // this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitEvaluation(tid, rating) {
    // submit the final evaluation by the evaluator
    // todo - get the API working
    // this.startLoading()

    let salt = uuid()
    let val = new BN(rating, 10)

    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: val
    })

    let cResponse = {successful: true} /*await this.colonyClient.submitTaskWorkRating.send({
      taskId: tid,
      role: 'EVALUATOR',
      ratingSecret: ratingSecret.secret,
    })*/

    // this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  /* ECP Protocol functions */
  waitForIPFS() {
    this.node = new Ipfs({ start: true })

    let that = this
    return new Promise((resolve, reject) => {
      that.node.on('ready', () => resolve(true));
      that.node.on('error', err => reject(err));
    })
  }

  async initIPFS() {
    await this.waitForIPFS()
    return true
  }

  async saveTaskSpecification(spec) {
    const data = Buffer.from(JSON.stringify(spec))
    const result = await this.node.files.add(data)
    return result[0].hash
  }

  async getTaskSpecification(hash) {
    let buf = await this.node.files.cat(`/ipfs/${hash}`)
    let spec
    try {
      spec = JSON.parse(buf.toString())
    } catch (e) {
      throw new Error(`Could not get task specification for hash ${hash}`)
    }
    return spec;
  }

  stopIPFS() { 
    this.node.stop() 
  }

  // helper functions for UI
  startLoading() {
    setTimeout(() => {this.networkLoading = true}, 0)
  }

  endLoading() {
    setTimeout(() => {this.networkLoading = false}, 0)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
