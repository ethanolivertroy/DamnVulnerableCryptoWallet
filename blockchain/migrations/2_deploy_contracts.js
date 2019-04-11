let DVCToken = artifacts.require('./DVCToken.sol');
let DVCTokenSale = artifacts.require('DVCTokenSale.sol');
const fs = require('fs');

const ownerDVC = web3.eth.accounts[8];
const ownerDVCSale = web3.eth.accounts[9];
const tokensSold = 0;
const initialSupply = 1000000;

module.exports = function(deployer, accounts) {
    deployer.deploy(DVCToken, initialSupply, {from: ownerDVC, value: 90000000000000000000}).then(function () {
     tokenPrice = 1000000000000000000;
     return deployer.deploy(DVCTokenSale, DVCToken.address, tokenPrice, tokensSold, {from: ownerDVCSale}).then(function () {
        fs.writeFile('contractAddress.txt', DVCToken.address + ',' + DVCTokenSale.address, function (err) {
          if (err) throw err;
        }); 
        }); 
      })
    }


