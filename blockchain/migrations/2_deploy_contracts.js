let Lottery = artifacts.require('./Lottery.sol')
let Donations = artifacts.require('./Donations.sol')
const OWNER = web3.eth.accounts[5]
const INITIAL_JACKPOT = web3.toWei(50, 'ether')
const SEED = 87

module.exports = function(deployer) {
    deployer.deploy(Lottery, SEED, {
        from: OWNER,
        value: INITIAL_JACKPOT
    })
    deployer.deploy(Donations, {
        from: OWNER,
        value: web3.toWei(10, 'ether')
    })
}
