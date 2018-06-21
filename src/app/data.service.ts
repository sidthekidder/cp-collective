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
import * as IPFS from 'ipfs';
import * as BN from 'bn.js';

import { providers, Wallet } from 'ethers';
import { TrufflepigLoader } from '@colony/colony-js-contract-loader-http';
import { environment } from '../environments/environment';

declare const Buffer

// uPort integration
// import registryArtifact from 'uport-registry';
// import Contract from 'truffle-contract';
// const Registry = Contract(registryArtifact)



@Injectable()
export class DataService {

  networkLoading: boolean
  envName: string
  user: any
  admin: any
  accountCount: number

  // colonyjs variables
  loader: any
  provider: any
  colonyNetworkClient: any
  colonyClient: any
  adminColonyNetworkClient: any
  adminColonyClient: any
  node: any // ipfs

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
    this.accountCount = 1

    // create the user object
    this.user = {
      'loggedIn': false
    }
    this.admin = {

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
    // if (typeof web3 !== 'undefined') {
    //   this.provider = new providers.Web3Provider(web3.currentProvider)
    //   this.user.wallet = this.provider.getSigner()
    // } else {
      this.provider = new providers.JsonRpcProvider('http://localhost:8545/')
    // }

    // create a demo account to view ColonyNetwork data
    // this will not create a proper user account - for that the user must generate a new account
    // if the user chooses to import his own private key, this wallet will be overwritten

    // Get the private key from the first account from the ganache-accounts through trufflepig
    this.loader.getAccount(0).then((data) => {
      const privateKey = data.privateKey

      // Create a wallet with the private key (so we have a balance we can use)
      that.user.wallet = new Wallet(privateKey, that.provider)
      that.admin.wallet = that.user.wallet

      // Create an adapter (powered by ethers)
      const adapter = new EthersAdapter({
        loader: that.loader,
        provider: that.provider,
        wallet: that.user.wallet,
      })

      // Connect to ColonyNetwork with that adapter
      that.colonyNetworkClient = new ColonyNetworkClient({ adapter })

      // use this secret admin connection for assigning tasks - it exists even after login
      that.adminColonyNetworkClient = new ColonyNetworkClient({ adapter })

      that.colonyNetworkClient.init().then(() => {
        that.adminColonyNetworkClient.init().then(() => {
          console.log('just set colonynetworkclient now')
          // connect to IPFS
          that.initIPFS().then(() => {
            that.endLoading()
          })
        })
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
    const { privateKey } = await this.loader.getAccount(this.accountCount++)

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

    while (this.colonyNetworkClient == undefined) {
      await this.sleep(500)
    }

    // For a colony that exists already, you just need its ID:
    this.colonyClient = await this.colonyNetworkClient.getColonyClient(colonyId);
    // keep admin updated too
    this.adminColonyClient = await this.adminColonyNetworkClient.getColonyClient(colonyId);

    this.clearColonyData()
    await this.getColonyData(colonyName)
    return
  }

  async connectToColonyMultiple() {
    let that = this
    if (this.colonyClient != undefined) return

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
    while (this.colonyClient == undefined) {
      await this.sleep(500)
    }

    let dc = await this.colonyClient.getDomainCount.call()
    this.domainCount = dc.count
    let tc = await this.colonyClient.getTaskCount.call()
    this.taskCount = tc.count

    for(var i = 0 ; i < this.domainCount ; i++) {
      let obj = await this.colonyClient.getDomain.call({domainId: i})
      this.domains.push(obj)
    }

    for(var j = 0 ; j < this.taskCount ; j++) {
      console.log('starting task ' + j)
      try {
        let task = await this.colonyClient.getTask.call({taskId: j})
        console.log(task)
        // get specification details
        console.log('getting spec hash ' + task.specificationHash)
        if (task.specificationHash == null) {
          //HACK if spec hash is empty then it's a unknown task so just skip it for now
          this.taskCount += 1
          continue
        }
        let taskDetails = {'title': 'Sample question', 'description': 'Difficult question about programming: http://codeforces.com/problemset/problem/990/G', 'url': 'http://codeforces.com/problemset/submission/990/39109082'}//FIXME await this.getTaskSpecification(task.specificationHash)
        task['details'] = taskDetails

        // get role open/closed details
        let taskWorker = await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'WORKER' })
        let taskEvaluator = await this.colonyClient.getTaskRole.call({ taskId: task.id, role: 'EVALUATOR' })

        task['worker'] = (taskWorker.address != null)? taskWorker.address : null
        task['evaluator'] = (taskEvaluator.address != null)? taskEvaluator.address : null

        task['colonyName'] = colonyName
        task['domainName'] = Constants.colonyToDomainMapping[colonyName][task.domainId].slug
        
        this.tasks.push(task)
      } catch (e) {
        console.log("Error in retrieving task: " + e)
        continue
      }
    }
    console.log(this.tasks)
    return
  }

  async assignTask(tid) {
    this.startLoading()

    let cResponse = await this.adminColonyClient.setTaskRoleUser.send({
      taskId: tid,
      role: 'WORKER',
      user: this.user.wallet.address
    })

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async assignEvaluate(tid) {
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

  async submitTask(tid, url) {
    this.startLoading()

    const deliverableHash = await this.saveTaskSpecification({ url: url });

    let cResponse = {successful: true} /*FIXME await this.colonyClient.submitTaskDeliverable.send({
      taskId: tid,
      deliverableHash: deliverableHash,
    })*/

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitTaskRating(tid, rating) {
    this.startLoading()

    let salt = uuid()
    let val = new BN(rating, 10)

    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: val
    })

    let cResponse = {successful: true} /*FIXME await this.colonyClient.submitTaskWorkRating.send({
      taskId: tid,
      role: 'WORKER',
      ratingSecret: ratingSecret.secret,
    })*/

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  async submitEvaluation(tid, rating) {
    this.startLoading()

    let salt = uuid()
    let val = new BN(rating)

    let ratingSecret = await this.colonyClient.generateSecret.call({
      salt: salt,
      value: val
    })

    let cResponse = {successful: true} /*FIXME await this.colonyClient.submitTaskWorkRating.send({
      taskId: tid,
      role: 'EVALUATOR',
      ratingSecret: ratingSecret.secret,
    })*/

    this.endLoading()
    if (cResponse.successful) {
      return {success: true}
    } else {
      return {success: false}
    }    
  }

  // `FS helper methods
  waitForIPFS() {
    this.node = new IPFS({ start: false })

    let that = this
    return new Promise((resolve, reject) => {
      that.node.on('ready', () => resolve(true));
      that.node.on('error', err => reject(err));
    })
  }

  async initIPFS() {
    await this.waitForIPFS()
    return this.node.start()
  }

  async saveTaskSpecification(spec) {
    const data = Buffer.from(JSON.stringify(spec))
    const result = await this.node.files.add(data)
    return result[0].hash
  }

  async getTaskSpecification(hash) {
    const buf = await this.node.files.cat(hash)
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
