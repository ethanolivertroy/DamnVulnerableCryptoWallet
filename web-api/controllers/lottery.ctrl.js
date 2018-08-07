const config = require('config')
const walletsCtrl = require('./wallets.ctrl')
const getWeb3 = require('../data/web3')
let web3 = getWeb3()

async function getData(contractAddress, fromWalletId) {
    if(web3.utils.isAddress(contractAddress)) {
        let lotteryContract = _getLotteryInstance(contractAddress)
        let publicAddress = (await walletsCtrl.getWallet(fromWalletId)).publicAddress
        
        let lotteryData = await Promise.all([
            lotteryContract.methods.lastResult().call({
                from: publicAddress
            }),
            web3.eth.getBalance(contractAddress)
        ])

        return { lastResult: lotteryData[0], jackpot: web3.utils.fromWei(lotteryData[1], 'ether') }
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

async function submitBet(guess, betAmount, fromWalletId, contractAddress) {
    if(_validateGuess(guess) && betAmount && web3.utils.isAddress(contractAddress)) {
        // Retrieve wallet
        let wallet = await walletsCtrl.getWallet(fromWalletId)
        
        // Instance the Lottery contract
        let lotteryContract = _getLotteryInstance(contractAddress)
        
        // We need the encoded ABI of the function we're calling to build the transaction
        let encodedABI = lotteryContract.methods.bet(guess).encodeABI()
        
        let tx = {
            from: wallet.publicAddress,
            to: contractAddress,
            gas: 70000,
            value: web3.utils.toWei(`${betAmount}`.replace(',', '.'), 'ether'),
            data: encodedABI
        }
        
        // Use the wallet's private key to sign transaction
        let privateKey = walletsCtrl.getWalletPrivateKey(wallet.seedEncrypted).toString('hex')
        let signedTx = await web3.eth.accounts.signTransaction(tx, `0x${privateKey}`)
        
        // Send the transaction
        let sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

        // Check if the user won
        let winner = await lotteryContract.methods.winner().call({
            from: wallet.publicAddress
        })
        
        return {tx: sentTx, winner}
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

function _validateGuess(guess) {
    try {
        guess = parseInt(guess)
        return guess >= 0 && guess <= 46
    } catch(error) {
        return false
    }
}

function _getLotteryInstance(contractAddress) {
    // Assuming that the contract is already deployed
    return new web3.eth.Contract(config.contracts[0].abi, contractAddress)
}

module.exports = {
    getData,
    submitBet
}
