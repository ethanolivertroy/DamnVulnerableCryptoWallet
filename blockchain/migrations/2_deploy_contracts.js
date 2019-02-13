let Lottery = artifacts.require('./Lottery.sol');
let Donations = artifacts.require('./Donations.sol');
let DVC = artifacts.require('./DVC.sol');

const OWNER = web3.eth.accounts[5];
const INITIAL_JACKPOT = web3.toWei(1, 'ether');
const SEED = 87;
const initialSupply = 1;

module.exports = function(deployer) {
    deployer.deploy(Lottery, SEED, {
        from: OWNER,
        value: INITIAL_JACKPOT
    })
    deployer.deploy(Donations, {
        from: OWNER,
        value: web3.toWei(0.1, 'ether')
    })
    deployer.deploy(DVC, initialSupply)
}
