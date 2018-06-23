// Import the prerequisites

const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');

var fs = require('fs');
var Constants = require('./app/generated_constants.js')
const ecp = require('./ecp');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

// The following methods use Promises
const example = async () => {

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

  console.log('Connected to Colony Network Client.')

  await ecp.init();

  //////////////////////////////////////////////////////////////////
  // Deploy the ERC20 token for all Colonies
  //////////////////////////////////////////////////////////////////
  const tokenAddress = await networkClient.createToken({
    name: 'Competitive Programmers Collective',
    symbol: 'PROG',
  });
  console.log('Token address: ' + tokenAddress);

  //////////////////////////////////////////////////////////////////
  // Create the Colonies - algorithms, data-structures, misc
  //////////////////////////////////////////////////////////////////
  let algoData = await networkClient.createColony.send({ tokenAddress });
  let dsData = await networkClient.createColony.send({ tokenAddress });
  let miscData = await networkClient.createColony.send({ tokenAddress });

  // update the colony ids in app constants
  Constants.colonyNameToIdMapping['algorithms'] = algoData.eventData.colonyId
  Constants.colonyNameToIdMapping['data-structures'] = dsData.eventData.colonyId
  Constants.colonyNameToIdMapping['misc'] = miscData.eventData.colonyId


  //////////////////////////////////////////////////////////////////
  // Initialize the Algorithm colony
  //////////////////////////////////////////////////////////////////
  const algoColonyClient = await networkClient.getColonyClient(algoData.eventData.colonyId)
  const algoSkillId = await algoColonyClient.getDomain.call({ domainId: 1 })

  // search, strings, sorting, greedy, dynamic programming
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  await algoColonyClient.addDomain.send({parentSkillId: algoSkillId.localSkillId})
  // use algoCount -0, -1, -2 etc respectively for above domains
  var count = await algoColonyClient.getDomainCount.call()
  let algoCount = count.count
  console.log('algocount is ' + algoCount)

  // sample questions
  var specificationHash = await ecp.saveTaskSpecification({ title: 'Q1', description: 'Search question 1.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q2', description: 'Search question 2.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q3', description: 'Search question 3.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q4', description: 'Search question 4.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q5', description: 'Search question 5.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q6', description: 'Strings question 6.' });
  await algoColonyClient.createTask.send({ specificationHash: specificationHash, domainId: algoCount-4  });
  // update the ids in constants file
  Constants.domainNameToIdMapping['algorithms']['search'] = algoCount-5
  Constants.domainNameToIdMapping['algorithms']['strings'] = algoCount-4
  Constants.domainNameToIdMapping['algorithms']['sorting'] = algoCount-3
  Constants.domainNameToIdMapping['algorithms']['greedy'] = algoCount-2
  Constants.domainNameToIdMapping['algorithms']['dp'] = algoCount-1
  Constants.domainNameToIdMapping['algorithms']['misc'] = algoCount

  //////////////////////////////////////////////////////////////////
  // Initialize the Data Structures colony
  //////////////////////////////////////////////////////////////////
  const dsColonyClient = await networkClient.getColonyClient(dsData.eventData.colonyId)
  const dsSkillId = await dsColonyClient.getDomain.call({ domainId: 1 })

  // linked-lists, arrays, trees, stacks-queues, graphs
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})
  await dsColonyClient.addDomain.send({parentSkillId: dsSkillId.localSkillId})

  // use dsCount -0, -1, -2 etc respectively for above domains
  count = await dsColonyClient.getDomainCount.call()
  let dsCount = count.count
  console.log('dscount is ' + dsCount)

  // sample questions
  specificationHash = await ecp.saveTaskSpecification({ title: 'Q4', description: 'Linked lists question 1.' });
  await dsColonyClient.createTask.send({ specificationHash: specificationHash, domainId: dsCount-5  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q5', description: 'Arrays question 1.' });
  await dsColonyClient.createTask.send({ specificationHash: specificationHash, domainId: dsCount-4  });

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q6', description: 'Arrays question 2.' });
  await dsColonyClient.createTask.send({ specificationHash: specificationHash, domainId: dsCount-4  });

  // update the ids in constants file
  Constants.domainNameToIdMapping['data-structures']['linked-lists'] = dsCount-5
  Constants.domainNameToIdMapping['data-structures']['arrays'] = dsCount-4
  Constants.domainNameToIdMapping['data-structures']['stacks-queues'] = dsCount-3
  Constants.domainNameToIdMapping['data-structures']['trees'] = dsCount-2
  Constants.domainNameToIdMapping['data-structures']['hash-maps'] = dsCount-1
  Constants.domainNameToIdMapping['data-structures']['graphs'] = dsCount

  //////////////////////////////////////////////////////////////////
  // Initialize the Miscellaneous colony
  //////////////////////////////////////////////////////////////////
  const miscColonyClient = await networkClient.getColonyClient(miscData.eventData.colonyId)
  const miscSkillId = await miscColonyClient.getDomain.call({ domainId: 1 })

  // maths, sql
  await miscColonyClient.addDomain.send({parentSkillId: miscSkillId.localSkillId})
  await miscColonyClient.addDomain.send({parentSkillId: miscSkillId.localSkillId})

  // use miscCount -0, -1, -2 etc respectively for above domains
  count = await miscColonyClient.getDomainCount.call()
  let miscCount = count.count
  console.log('miscCount is ' + miscCount)

  // sample questions
  specificationHash = await ecp.saveTaskSpecification({ title: 'Q7', description: 'Linked lists question 1.' })
  await miscColonyClient.createTask.send({ specificationHash: specificationHash, domainId: miscCount-1  })

  specificationHash = await ecp.saveTaskSpecification({ title: 'Q8', description: 'Arrays question 1.' })
  await miscColonyClient.createTask.send({ specificationHash: specificationHash, domainId: miscCount  })

  // update the ids in constants file
  Constants.domainNameToIdMapping['misc']['linked-lists'] = miscCount-1
  Constants.domainNameToIdMapping['misc']['arrays'] = miscCount


  // write the updates to file
  fs.writeFileSync(__dirname + '/app/generated_constants.js', 'module.exports = ' + JSON.stringify(Constants, null, 2))

  // cleanup
  // await ecp.stop();
  return
};

module.exports = example;
