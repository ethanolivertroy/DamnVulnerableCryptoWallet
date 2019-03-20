let DVCToken = artifacts.require('./DVCToken.sol');
let DVCTokenSale = artifacts.require('DVCTokenSale.sol');
const fs = require('fs');

const OWNER = web3.eth.accounts[9];
const tokensSold = 0;
const network = 'development'
const initialSupply = 1000000;

module.exports = function(deployer, accounts) {
    deployer.deploy(DVCToken, initialSupply, {from: OWNER}).then(function () {
     tokenPrice = 1000000000000000000;
      return deployer.deploy(DVCTokenSale, DVCToken.address, tokenPrice, tokensSold).then(function () {
        fs.writeFile('contractAddress.txt', DVCToken.address + ',' + DVCTokenSale.address, function (err) {
          if (err) throw err;
        }); 
        }); 
      })
    }


