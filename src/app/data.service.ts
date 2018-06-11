import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as $ from 'jquery';
import EthersAdapter from '@colony/colony-js-adapter-ethers';
import ColonyNetworkClient from '@colony/colony-js-client';
import { Constants} from './constants'

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

  async newAccount() {
    // Get the private key from the first account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await this.loader.getAccount(0)

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

    const colonyId = Constants.colonyNameToIdMapping[colonyName]

    //TODO
    // while (this.colonyNetworkClient == undefined) {
      // await this.sleep(500)
    // }

    // For a colony that exists already, you just need its ID:
    //TODO
    // this.colonyClient = await this.colonyNetworkClient.getColonyClient(colonyId);
    console.log('getitng colony data now')
    await this.getColonyData()
    console.log(this.domains)
    console.log(this.tasks)
    return
  }

  async getColonyData() {
    this.domainCount = 5//TODO await this.colonyClient.getDomainCount.call()
    this.taskCount = 3//TODO await this.colonyClient.getTaskCount.call()
    this.domains = []
    this.tasks = []

    for(var i = 0 ; i < this.domainCount ; i++) {
      let obj = {localSkillId: 1, potId: 1}//TODO await this.colonyClient.getDomain.call({taskId: i})
      this.domains.push(obj)
    }

    for(var j = 0 ; j < this.taskCount ; j++) {
      let obj = {id: 1, domainId: 0, specificationHash: 'abc', skillId: 1, potId: 1}//TODO await this.colonyClient.getTask.call({taskId: i})

      let taskDetails = {title: 'Sample question', description: 'Difficult question about programming'}//TODO await ecp.getTaskSpecification(obj.specificationHash)
      obj['details'] = taskDetails
      this.tasks.push(obj)
    }

    return
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
