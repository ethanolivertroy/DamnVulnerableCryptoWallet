let Lottery = artifacts.require('./Lottery.sol')
let Donations = artifacts.require('./Donations.sol')

module.exports = async function(deployer) {
    const accounts = await web3.eth.getAccounts()
    const OWNER = accounts[5]
    const INITIAL_JACKPOT = web3.utils.toWei('50', 'ether')
    const SEED = 87

    await deployer.deploy(Lottery, SEED, {
        from: OWNER,
        value: INITIAL_JACKPOT
    })
    await deployer.deploy(Donations, {
        from: OWNER,
        value: web3.utils.toWei('10', 'ether')
    })
}
