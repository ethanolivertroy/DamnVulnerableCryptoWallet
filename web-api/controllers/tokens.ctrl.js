const config = require('config')
const walletsCtrl = require('./wallets.ctrl')
const getWeb3 = require('../data/web3')
const fs = require('fs');
let web3 = getWeb3()


async function getTokensData(fromWalletId) {
    let wallet = await walletsCtrl.getWallet(fromWalletId)
    let walletAddress = wallet.publicAddress

    if(web3.utils.isAddress(walletAddress)) {
        
        let addresses = await _getContractAddresses();
        let tokenInstance = await _getTokensInstance(addresses[0])
        let tokenSaleInstance = await _getTokensSaleInstance(addresses[1])
        let balance = await tokenInstance.methods.balanceOf(walletAddress).call()
        let tokenPrice = await tokenSaleInstance.methods.tokenPrice().call()
        let tokensSold = await tokenSaleInstance.methods.tokensSold().call()
        let tokenSaleBalanceinWei = await web3.eth.getBalance(addresses[1])
        let tokenBalanceinWei = await web3.eth.getBalance(addresses[0])
        let userBalanceinWei = await web3.eth.getBalance(walletAddress)
        let tokenSaleBalance = await tokenInstance.methods.balanceOf(addresses[1]).call()
        let tokenBalance = await tokenInstance.methods.balanceOf(addresses[0]).call()

        let suscription = await tokenInstance.events.Transfer({}, (error, data) => {
            if(error){
                console.log("Error: " + error)
            }
            else {
                console.dir("Data: " + JSON.stringify(data))
            }
        });
        //console.log(transferEvent)
        //let transferWatch = await transferEvent.watch(function (error, result) {if (error) {console.log(error)} else {console.log(result)}})
        
        return { 
            balance,
            tokenPrice,
            tokensSold,
            tokenSaleBalanceinWei,
            tokenBalanceinWei,
            tokenBalance,
            tokenSaleBalance,
            userBalanceinWei,
        }


    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

async function buyTokens(amountToBuy, fromWalletId) {
    let wallet = await walletsCtrl.getWallet(fromWalletId)
    let walletAdress = wallet.publicAddress
    if(amountToBuy > 0 && web3.utils.isAddress(walletAdress)) {
        let addresses = await _getContractAddresses();
        let tokenSaleAddress = addresses[1]
        let tokenSaleInstance = await _getTokensSaleInstance(addresses[1])
        let encodedABI = tokenSaleInstance.methods.buyTokens(amountToBuy).encodeABI()
        let value = web3.utils.toWei(`${amountToBuy}`.replace(',', '.'), 'ether')
        console.log(value)
        let holderBalance = await web3.eth.getBalance(wallet.publicAddress)
        console.log(holderBalance)
        try {
            let tx = {
                from: walletAdress,
                to: tokenSaleAddress,
                value: value,
                gas: 200000,
                data: encodedABI
            }

            // Use the wallet's private key to sign transaction
            let privateKey = walletsCtrl.getWalletPrivateKey(wallet.seedEncrypted).toString('hex')
            let signedTx = await web3.eth.accounts.signTransaction(tx, `0x${privateKey}`)
            console.log(signedTx)
            
            // Send the transaction
            let transaction = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            return transaction
        }
        catch(err){
            console.log(err)
        }
        
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}

async function sellTokens(amountToSell, fromWalletId) {
    let wallet = await walletsCtrl.getWallet(fromWalletId)
    let walletAdress = wallet.publicAddress
    if(amountToSell > 0 && web3.utils.isAddress(fromWalletId)) {
        // Retrieve wallet  && Instance the DVCToken contract
        
        let addresses = await _getContractAddresses();
        let tokenSaleAddress = addresses[1]
        let tokenSaleInstance = await _getTokensSaleInstance(addresses[1])

        // We need the encoded ABI of the function we're calling to build the transaction

        let encodedABI = tokenSaleInstance.methods.sellTokens(amountToSell).encodeABI()
        
        try {
            
            let tx = {
                from: walletAdress,
                to: tokenSaleAddress,
                gas: 200000,
                data: encodedABI
            }

            // Use the wallet's private key to sign transaction
            let privateKey = walletsCtrl.getWalletPrivateKey(wallet.seedEncrypted).toString('hex')
            let signedTx = await web3.eth.accounts.signTransaction(tx, `0x${privateKey}`)

            // Send the transaction
            let transaction = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            
            return transaction
        }
        catch(err){
            console.log(err)
        }
        
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        throw error
    }
}


function _getTokensInstance(contractAddress) {
    return new web3.eth.Contract(config.contracts[0].abi, contractAddress)
}

function _getTokensSaleInstance(contractAddress) {
    return new web3.eth.Contract(config.contracts[1].abi, contractAddress)
}

async function _getContractAddresses() {
    try {
        let addresses = await fs.readFileSync('../blockchain/contractAddress.txt')
        addresses = addresses.toString('utf8').split(',')
        return addresses
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    getTokensData,
    sellTokens,
    buyTokens
}
