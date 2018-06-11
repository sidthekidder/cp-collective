import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as $ from 'jquery';
import * as EthersAdapter from '@colony/colony-js-adapter-ethers';
import * as ColonyNetworkClient from '@colony/colony-js-client';

import { providers, Wallet } from 'ethers';
import { TrufflepigLoader } from '@colony/colony-js-contract-loader-http';
import { environment } from '../environments/environment';

@Injectable()
export class DataService {

  networkLoading: boolean;
  envName: string;

  constructor(private http: HttpClient) {
    this.networkLoading = false
    this.envName = environment.envName
    this.initLib()
  }

  initLib() {

  }

  async sampleBootup(initialLoad) {
    // Import the prerequisites
    // Create an instance of the Trufflepig contract loader
    const loader = new TrufflepigLoader();

    // Create a provider for local TestRPC (Ganache)
    const provider = new providers.JsonRpcProvider('http://localhost:8545/');

    // Get the private key from the first account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await loader.getAccount(0);

    // Create a wallet with the private key (so we have a balance we can use)
    const wallet = new Wallet(privateKey, provider);

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader,
      provider,
      wallet,
    });

    // Connect to ColonyNetwork with the adapter!
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // Let's deploy a new ERC20 token for our Colony.
    // You could also skip this step and use a pre-existing/deployed contract.
    const tokenAddress = await networkClient.createToken({
      name: 'Cool Colony Token',
      symbol: 'COLNY',
    });
    console.log('Token address: ' + tokenAddress);

    // Create a cool Colony!
    const {
      eventData: { colonyId, colonyAddress },
    } = await networkClient.createColony.send({ tokenAddress });

    // Congrats, you've created a Colony!
    console.log('Colony ID: ' + colonyId);
    console.log('Colony address: ' + colonyAddress);

    // For a colony that exists already, you just need its ID:
    const colonyClient = await networkClient.getColonyClient(colonyId);

    // Or alternatively, just its address:
    // const colonyClient = await networkClient.getColonyClientByAddress(colonyAddress);

    // You can also get the Meta Colony:
    const metaColonyClient = await networkClient.getMetaColonyClient();
    console.log('Meta Colony address: ' + metaColonyClient.contract.address);
  }

  startLoading() {
    setTimeout(() => {this.networkLoading = true}, 0)
  }

  endLoading() {
    setTimeout(() => {this.networkLoading = false}, 0)
  }
}
