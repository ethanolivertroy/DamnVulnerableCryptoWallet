const config = require('config')
const walletsCtrl = require('./wallets.ctrl')
const getWeb3 = require('../data/web3')
const fs = require('fs');
const http = require('http')
let web3 = getWeb3()


async function getTokensData(fromWalletId) {
    let wallet = await walletsCtrl.getWallet(fromWalletId)
    let walletAddress = wallet.publicAddress

    if(web3.utils.isAddress(walletAddress)) {
        
        let addresses = await _getContractAddresses();
        let DVCTokenAddress = addresses[0]
        let DVCTokenSaleAddress = addresses[1]
        let tokenInstance = await _getTokensInstance(addresses[0])
        let tokenSaleInstance = await _getTokensSaleInstance(addresses[1])
        let userBalanceinDVC = await tokenInstance.methods.balanceOf(walletAddress).call()
        let tokenPrice = await tokenSaleInstance.methods.tokenPrice().call()
        let tokensSold = await tokenSaleInstance.methods.tokensSold().call()
        let tokenSaleBalanceinWei = await web3.eth.getBalance(addresses[1])
        let tokenSaleBalanceinETH = web3.utils.fromWei(tokenSaleBalanceinWei, 'ether')
        let userBalanceinWei = await web3.eth.getBalance(walletAddress)
        let userBalanceinETH = web3.utils.fromWei(userBalanceinWei, 'ether')
        let tokenSaleBalance = await tokenInstance.methods.balanceOf(addresses[1]).call()

        
        return { 
            userBalanceinDVC,
            tokenPrice,
            tokensSold,
            tokenSaleBalanceinETH,
            tokenSaleBalance,
            userBalanceinETH,
            DVCTokenAddress,
            DVCTokenSaleAddress
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

        let holderBalance = await web3.eth.getBalance(wallet.publicAddress)
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
            let error = new Error(err)
            error.statusCode = 500
            throw error
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

function _getContractAddresses() {
    let url = ""
    return new Promise((resolve, reject) => {
      if(process.env.TRUFFLE_HOST) {
        url = `http://${process.env.TRUFFLE_HOST}:8000/contractAddress.txt`
      }
      else{
        url = `http://localhost:8000/contractAddress.txt`
      }
      console.log("url tokens " + url)
      http.get(url, res => {
        res.setEncoding('utf8');
        let body = ''; 
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body.toString('utf8').split(',')));
      }).on('error', reject);
    }
  )}
  
module.exports = {
    getTokensData,
    sellTokens,
    buyTokens
}
