const db = require('../data')
const walletsCtrl = require('./wallets.ctrl')
const getWeb3 = require('../data/web3')
let web3 = getWeb3()

async function makeTransaction(tx) {
    let fromWallet = await walletsCtrl.getWallet(tx.fromWalletId)
    if(fromWallet && _validateTransaction(tx, fromWallet.publicAddress)) {
        // Generate private key and send transaction to blockchain
        let privateKey = walletsCtrl.getWalletPrivateKey(fromWallet.seedEncrypted)
        let receipt = await _sendTransaction(fromWallet.publicAddress, tx.toAddr, tx.value, privateKey)
        tx.fromAddr = fromWallet.publicAddress
        tx.hash = receipt.transactionHash
        
        // Find block where transaction was stored and get its timestamp
        let block = await _getBlock(receipt.blockNumber)
        tx.timestamp = block.timestamp

        // Wallet ID is no longer necessary
        delete(tx.fromWalletId)
        
        // Store transaction in DB
        let storedTx = db.saveTransaction(tx)

        // Rename 'fromAddr' and 'toAddr' properties
        storedTx.from = storedTx.fromAddr
        delete(storedTx.fromAddr)
        storedTx.to = storedTx.toAddr        
        delete(storedTx.toAddr)

        return storedTx
    } else {
        let error = new Error('Invalid transaction')
        error.statusCode = 400
        throw error
    }
}

async function getWalletTransactions(address, page) {
    if(web3.utils.isAddress(address) && _validatePageNumber(page)) {
        let pageNumber = parseInt(page)
        let response = {}
        response.balance = await walletsCtrl.getWalletBalance(address)

        // Get wallet's transactions from DB ( { data:[{hash, message}], next } )
        response.transactions = db.getWalletTransactions(address, pageNumber)
        
        // For each transaction ID, get the whole transaction from the blockchain
        let blockchainTxs = await Promise.all(response.transactions.data.map(async (tx) => {
            return web3.eth.getTransaction(tx.hash)            
        }))

        // Set the transaction message and timestamp (stored in DB). Format transaction value to ETH.
        blockchainTxs.forEach((tx, index) => {
            let dbTx = response.transactions.data.find(x => x.hash === tx.hash)
            blockchainTxs[index].message = dbTx.message
            blockchainTxs[index].timestamp = dbTx.timestamp
            blockchainTxs[index].value = web3.utils.fromWei(tx.value, 'ether')
        })
        response.transactions.data = blockchainTxs

        return response        
    } else {
        let error = new Error('Invalid data')
        error.statusCode = 400
        throw error
    }
}

function _validatePageNumber(page) {
    try {
        let n = parseInt(page)
        return n > 0 && n < 999
    } catch(error) {
        return false
    }
}

async function _sendTransaction(fromAddr, toAddr, value, privateKey) {   
    let tx = {
        from: fromAddr,
        to: toAddr,
        value: web3.utils.toWei(`${value}`.replace(',', '.'), 'ether'),
        gas: 21000
    }
    let signedTx = await web3.eth.accounts.signTransaction(tx, `0x${privateKey.toString('hex')}`)
    return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
}

async function _getBlock(blockNumber) {
    return web3.eth.getBlock(blockNumber)
}

function _validateTransaction(tx, fromAddress) {
    /**
     * Transaction is invalid if value <= 0,
     * "from" address equals "to" address,
     * or "to" address is invalid
     */
    return tx.value > 0 && fromAddress != tx.toAddr && web3.utils.isAddress(tx.toAddr)
}

module.exports = {
    makeTransaction,
    getWalletTransactions
}
