let Lottery = artifacts.require('./Lottery.sol');
let Donations = artifacts.require('./Donations.sol');
let DVCToken = artifacts.require('./DVCToken.sol');
let DVCTokenSale = artifacts.require('DVCTokenSale.sol');
//let DVCTokenSaleAttacker = artifacts.require('./DVCTokenSaleAttacker.sol');

const OWNER = web3.eth.accounts[5];
const INITIAL_JACKPOT = web3.toWei(1, 'ether');
const SEED = 87;
const initialSupply = 100000;

module.exports = function(deployer) {
    deployer.deploy(DVCToken, initialSupply).then(function () {
     tokenPrice = 1000000000000000000;
      return deployer.deploy(DVCTokenSale, DVCToken.address, tokenPrice).then(function () {
	  //return deployer.deploy(DVCTokenSaleAttacker, DVCTokenSale.address)
      })
    });
}
