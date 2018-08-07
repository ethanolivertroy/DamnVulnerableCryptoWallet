const config = require('config')
const walletsCtrl = require('./wallets.ctrl')
const getWeb3 = require('../data/web3')
let web3 = getWeb3()

async function getData(contractAddress, fromWalletId) {
    if(web3.utils.isAddress(contractAddress)) {
        let donationsContract = _getDonationsInstance(contractAddress)
        let publicAddress = (await walletsCtrl.getWallet(fromWalletId)).publicAddress
        
        let donationsData = await Promise.all([
            donationsContract.methods.getDonationAmount(publicAddress).call({
                from: publicAddress
            }),
            web3.eth.getBalance(contractAddress)
        ])

        return { 
            donationTotal: web3.utils.fromWei(donationsData[0], 'ether'),
            balance: web3.utils.fromWei(donationsData[1], 'ether')
        }
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

async function makeDonation(donationAmount, fromWalletId, contractAddress) {
    if(donationAmount && donationAmount > 0 && web3.utils.isAddress(contractAddress)) {
        // Retrieve wallet
        let wallet = await walletsCtrl.getWallet(fromWalletId)
        
        // Instance the Donations contract
        let donationsContract = _getDonationsInstance(contractAddress)
        
        // We need the encoded ABI of the function we're calling to build the transaction
        let encodedABI = donationsContract.methods.donate().encodeABI()
        
        let tx = {
            from: wallet.publicAddress,
            to: contractAddress,
            value: web3.utils.toWei(`${donationAmount}`.replace(',', '.'), 'ether'),
            gas: 50000,
            data: encodedABI
        }
        
        // Use the wallet's private key to sign transaction
        let privateKey = walletsCtrl.getWalletPrivateKey(wallet.seedEncrypted).toString('hex')
        let signedTx = await web3.eth.accounts.signTransaction(tx, `0x${privateKey}`)
        
        // Send the transaction
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

function _getDonationsInstance(contractAddress) {
    return new web3.eth.Contract(config.contracts[1].abi, contractAddress)
}

module.exports = {
    getData,
    makeDonation
}
