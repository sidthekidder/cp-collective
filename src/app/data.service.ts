import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as $ from 'jquery';
import EthersAdapter from '@colony/colony-js-adapter-ethers';
import ColonyNetworkClient from '@colony/colony-js-client';
import { Constants} from './constants'
import { uuidv4 } from 'uuid/v4';

import { providers, Wallet } from 'ethers';
import { TrufflepigLoader } from '@colony/colony-js-contract-loader-http';
import { environment } from '../environments/environment';

import ecp from '../ecp';



@Injectable()
export class DataService {

  networkLoading: boolean;
  envName: string;
  user: any

  // colonyjs variables
  loader: any
  provider: any
  colonyNetworkClient: any
  colonyClient: any

  taskCount: number
  domainCount: number
  tasks: Array<any>
  domains: Array<any>

  constructor(private http: HttpClient) {
    this.networkLoading = false
    this.envName = environment.envName

    this.taskCount = 0
    this.domainCount = 0
    this.tasks = []
    this.domains = []

    // create the user object
    this.user = {
      'loggedIn': false
    }
    this.initLib()
  }

  initLib() {
    // don't perform network calls before initialization is finished
    this.startLoading()

    let that = this
    // Create an instance of the Trufflepig contract loader
    this.loader = new TrufflepigLoader();

    // Create a provider for local TestRPC (Ganache)
    this.provider = new providers.JsonRpcProvider('http://localhost:8545/');

    // create a demo account to view ColonyNetwork data
    // this will not create a proper user account - for that the user must generate a new account
    // if the user chooses to import his own private key, this wallet will be overwritten

    // Get the private key from the first account from the ganache-accounts through trufflepig
    this.loader.getAccount(0).then((data) => {
      const privateKey = data.privateKey

      // Create a wallet with the private key (so we have a balance we can use)
      that.user.wallet = new Wallet(privateKey, that.provider)

      // Create an adapter (powered by ethers)
      const adapter = new EthersAdapter({
        loader: that.loader,
        provider: that.provider,
        wallet: that.user.wallet,
      })

      // Connect to ColonyNetwork with that adapter
      that.colonyNetworkClient = new ColonyNetworkClient({ adapter })
      that.colonyNetworkClient.init().then(() => {
        console.log('just set colonynetworkclient now')
        that.endLoading()
      })
    })
  }

  resetAccount() {
    this.user.wallet = {}
    this.user.loggedIn = false
  }

  async newAccount() {
    // Get the private key from the first account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await this.loader.getAccount(0)

    // Create a wallet with the private key (so we have a balance we can use)
    this.user.wallet = new Wallet(privateKey, this.provider)
    console.log('balance is')
    // this.user.wallet.getBalance('latest').then((b)=>{
      // console.log(b)
    // })

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader: this.loader,
      provider: this.provider,
      wallet: this.user.wallet,
    })

    // Connect to ColonyNetwork with that adapter
    this.colonyNetworkClient = new ColonyNetworkClient({ adapter })
    await this.colonyNetworkClient.init()

    this.user.loggedIn = true
  }

  async existingAccount(privateKey) {
    // Create a wallet with the private key (so we have a balance we can use)
    this.user.wallet = new Wallet(privateKey, this.provider)

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader: this.loader,
      provider: this.provider,
      wallet: this.user.wallet,
    })

    // Connect to ColonyNetwork with that adapter
    this.colonyNetworkClient = new ColonyNetworkClient({ adapter })
    await this.colonyNetworkClient.init()

    this.user.loggedIn = true
  }

  logOut() {
    // flush away user properties
    this.user = {
      'loggedIn': false
    }
  }

  async connectToColony(colonyName) {
    if (this.colonyClient != undefined) return

    // make sure that all data is loaded even if this is the first page opened (without navigating from homepage)
    const colonyId = Constants.colonyNameToIdMapping[colonyName]

    //TODO
    // while (this.colonyNetworkClient == undefined) {
      // await this.sleep(500)
    // }

    // For a colony that exists already, you just need its ID:
    //TODO
    // this.colonyClient = await this.colonyNetworkClient.getColonyClient(colonyId);
    this.clearColonyData()
    await this.getColonyData(colonyName)
    return
  }

  async connectToColonyMultiple() {
    let that = this
    if (this.colonyClient != undefined) return

    //TODO
    // while (this.colonyNetworkClient == undefined) {
      // await this.sleep(500)
    // }

    // loop through all colonies and get the data for each one
    Object.keys(Constants.colonyNameToIdMapping).forEach((key) => {
      let cid = Constants.colonyNameToIdMapping[key]
      this.colonyNetworkClient.getColonyClient(cid).then((data) => {
        that.colonyClient = data
        that.getColonyData(key)
      })
    })

    // For a colony that exists already, you just need its ID:
    //TODO this.colonyClient = await this.colonyNetworkClient.getColonyClient(colonyId);

    return
  }

  clearColonyData() {
    this.domains = []
    this.tasks = []
  }

  async getColonyData(colonyName) {
    this.domainCount = 5//TODO await this.colonyClient.getDomainCount.call()
    this.taskCount = 3//TODO await this.colonyClient.getTaskCount.call()

    for(var i = 0 ; i < this.domainCount ; i++) {
      let obj = {localSkillId: 1, potId: 1}//TODO await this.colonyClient.getDomain.call({taskId: i})
      this.domains.push(obj)
    }

    for(var j = 0 ; j < this.taskCount ; j++) {
      let task = {id: 1, domainId: 0, specificationHash: 'abc', skillId: 1, potId: 1, finalized: false}//TODO await this.colonyClient.getTask.call({taskId: i})

      // get specification details
      let taskDetails = {'title': 'Sample question', 'description': 'Difficult question about programming: http://codeforces.com/problemset/problem/990/G', 'url': 'http://codeforces.com/problemset/submission/990/39109082'}//TODO await ecp.getTaskSpecification(obj.specificationHash)
      task['details'] = taskDetails

      // get role open/closed details
      let taskWorker = {'address': null, 'rated': true, 'rating': 2}//TODO await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'WORKER' })
      let taskEvaluator = {'address': null, 'rated': false, 'rating': null}//TODO await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'EVALUATOR' })

      task['worker'] = (taskWorker.address != null)? taskWorker.address : null
      task['evaluator'] = (taskEvaluator.address != null)? taskEvaluator.address : null

      task['colonyName'] = colonyName
      task['domainName'] = Constants.colonyToDomainMapping[colonyName][task.domainId].slug

      this.tasks.push(task)
    }
    return
  }

  async assignTask(tid) {
    this.startLoading()

    let cResponse = {successful: true}//TODO await this.colonyClient.setTaskRoleUser.send({
    //   taskId: tid,
    //   role: 'WORKER',
    //   user: this.user.wallet.address
    // })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async assignEvaluate(tid) {
    this.startLoading()
    console.log('creating new role for task:')
    console.log({
      taskId: tid,
      role: 'EVALUATOR',
      user: this.user.wallet.address
    })
    let cResponse = {successful: true}//TODO await this.colonyClient.setTaskRoleUser.send({
    //   taskId: tid,
    //   role: 'WORKER',
    //   user: this.user.wallet.address
    // })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitTask(tid, url) {
    this.startLoading()

    const deliverableHash = 'abcde'//TODO await ecp.saveTaskSpecification({ url: url });

    let cResponse = {successful: true}//TODO await this.colonyClient.submitTaskDeliverable.send({
    //   taskId: tid,
    //   deliverableHash: deliverableHash,
    // })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitTaskRating(tid, rating) {
    this.startLoading()

    let salt = uuidv4()
    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: rating
    })

    let cResponse = {successful: true}//TODO await this.colonyClient.submitTaskWorkRating.send({
    //   taskId: tid,
    //   role: 'WORKER',
    //   ratingSecret: ratingSecret.secret,
    // })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitEvaluation(tid, rating) {
    this.startLoading()

    let salt = uuidv4()
    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: rating
    })

    let cResponse = {successful: true}//TODO await this.colonyClient.submitTaskWorkRating.send({
    //   taskId: tid,
    //   role: 'EVALUATOR',
    //   ratingSecret: ratingSecret.secret,
    // })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

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
