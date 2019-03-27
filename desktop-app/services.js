const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const axios = require('axios')
const cfgManager = require('./config')
const config = cfgManager.getConfig()
let dataPath = require('electron').app.getPath('userData')

axios.defaults.baseURL = config.server

// Set proxy settings if configured
if(config.proxyHost && config.proxyHost.length && config.proxyPort) {
    console.log('Configuring proxy at: ' + config.proxyHost + ':' + config.proxyPort)
    axios.defaults.proxy = {
        host: config.proxyHost,
        port: config.proxyPort
    }
}

// Define a response interceptor to handle, parse and log errors
axios.interceptors.response.use(
    response => { return response },
    error => {
        // Log the full error
        log.error(`An error with status ${error.response.status} ${error.response.statusText} occurred.
        Method: ${error.response.config.method}
        URL: ${error.response.config.url}
        Message: ${error.response.data.error}`)
        // Throw error message only
        throw new Error(error.response.data.error)
        
    }
)

exports.getRoot = async () => {
    return axios.get('/').then(function(response){return true}).catch(function (error) {console.log('error' + error);});
}

exports.createWallet = async () => {
    return axios.post('/wallets/new', {}).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error});
}

exports.recoverWallet = async (mnemonic) => {
    return axios.post('/wallets/recover', {mnemonic}).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.getWalletTransactions = async (publicAddress, pageNumber) => {
    let queryParams = { params: {page: pageNumber} }
    return axios.get(`/wallets/${publicAddress}/transactions`, queryParams).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.registerPassword = (walletId, password) => {
    let data = {password}
    return axios.post(`/wallets/${walletId}/register-password`, data).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.changePassword = async (walletId, oldPassword, newPassword) => {
    let data = [oldPassword, newPassword]
    let config = {
        headers: {'Content-Type': 'text/plain'}
    }
    return axios.post(`/wallets/${walletId}/change-password`, data).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.getWallet = async (walletId) => {
    return axios.get(`/wallets/${walletId}`).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.changeProfile = async (walletId, profile) => {
    return axios.post(`/wallets/${walletId}/change-profile`, profile).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.submitTransaction = async (tx, otp) => {
    return axios.post('/transactions/new', {tx}).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.getTokensData = async (walletId) => {
    let queryParams = { params: {fromId: walletId} }
    return axios.get('/tokens/data', queryParams).then(function(response){return response}).catch(function (error) {console.log('error' + error);return error})
}

exports.buyTokens = async (walletId, amountToBuy) => {
    let data = {fromId: walletId, amountToBuy}
    return axios.post('/tokens/buy', data)
}

exports.sellTokens = async (walletId, amountToSell) => {
    let data = {fromId: walletId, amountToSell}
    return axios.post('/tokens/sell', data)
}

exports.persistData = (data) => {
    /**
     * Saves data into a local file
     */
    fs.writeFile(path.join(dataPath, config.localdata), JSON.stringify({wallet: data.wallet}), 'utf8', err => {
        if(err) {
            log.error('An error occurred while writing localdata.json to disk: ' + err)
        }
    })
}

exports.persistConfig = (newConfig) => {
    config.server = newConfig.server
    cfgManager.saveConfig(newConfig)
}

exports.readLocalData = async () => {
    /**
     * Reads data from local file.
     */
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(dataPath, config.localdata), 'utf8', (err, data) => {
            err ? reject(err) : resolve(data)
        })
    })
}
