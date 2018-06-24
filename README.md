# Competitive Programmers Collective

Competitive Programmers Collective is a Colony that aims to bring together and help programmers grow their problem-solving skills and ranking, and keep track of reputation across the internet. It is a decentralized community made up of programmers and learners just like you.

# Why?

Most programmers/college students interviewing for CS jobs usually end up practicing competitive programming questions for interview coding rounds. There are various sites that help exist to help you with this - topcoder, leetcode etc. BUT all these sites are disconnected and your contest history/ranking - the reputation and respect gained by solving problems previously - are not transferable or owned by you.

# How? 

Earn your respect by solving problems and competing in contests across various competitive programming sites. Help others earn respect by checking their correct or incorrect submissions. Cash in your reputation while applying for jobs/coding interviews. There is something to gain for everyone, from students to experienced professionals!

### Installation
- nodejs and npm must be installed on your system
- ganache-cli must be running on localhost:8545
- truffle-pig must be running with deployed colonyJS contracts
- for the above steps, first install this repository: [https://github.com/joinColony/colonyNetwork](https://github.com/joinColony/colonyNetwork)
- add ```"deploy-contracts": "./node_modules/.bin/truffle migrate --compile-all --reset",
    "start-ganache": "ganache-cli -d --gasLimit 7000000 --acctKeys ganache-accounts.json --noVMErrorsOnRPCResponse",
    "start-trufflepig": "trufflepig --ganacheKeyFile ganache-accounts.json"```
    to the `scripts` object in `package.json` of the above repo
- finally run `npm run start-ganache`, `npm run deploy-contracts`, and `npm run start-trufflepig` in different terminals

Now to run the app itself,
- navigate to the root directory of the project and run the following:
- `sudo npm install -g @angular/cli`
- `npm install`
- `node src/initColonyData.js`
- `ng serve`
- open http://localhost:4500
- additionally, see the [demo video](https://www.youtube.com/watch?v=o0ULFONjPlI) for a tour of the functionality

# License
MIT
