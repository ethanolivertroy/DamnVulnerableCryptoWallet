const { app, ipcMain } = require('electron')
const log = require('electron-log')
const cfgManager = require('./config')
const config = cfgManager.getConfig()
const services = require('./services')
const winManager = require('./windows')
const utils = require('./utils')
let localdata = require('./data/default-localdata')
let sharedAddress = null

// Register protocol handler
app.setAsDefaultProtocolClient('dvcw')

// Open port for debugging purposes
app.commandLine.appendSwitch('remote-debugging-port', config.debugPort)

/**
 * Initializes the application depending on: the server status, the existence of a local file used
 * to store the user data (localdata), and whether there's a password set by the user or not.
 */
async function initApp() {
    if(await utils.isServerOnline()) {
        try {
            let data = await services.readLocalData()
            localdata = JSON.parse(data)
        } catch(err) {
            try {
                let response = await services.createWallet()
                localdata.wallet = response.data
                services.persistData(localdata)
                log.warn(`Created new wallet with address ${localdata.wallet.publicAddress}`)
            } catch(error) {
                log.error(error)
            }
        } finally {
            if(utils.isPasswordSet(localdata.wallet)) {
                winManager.createLoginWindow()
            } else {
                winManager.createRegisterWindow()
            }
        }
    } else {
        log.warn('Server is offline. Requesting a new server address.')
        if(!winManager.isAnyWindowOpen()) {
            winManager.createServerSettingsWindow()
        }
    }
}

/* REQUEST HANDLERS */

async function handleTransactionsDataRequest(event, page) {
    try {
        let response = await services.getWalletTransactions(localdata.wallet.publicAddress, page)
        localdata.wallet.balance = response.data.balance
        let transactions = response.data.transactions.data
        
        // Here we append new data to localdata just to pass it to the renderer process
        // These properties shouldn't be written to local file
        // and could have also been passed as extra args in send()
        let next = response.data.transactions.next
        let tx = {
            toAddr: sharedAddress || ''
        }
        event.sender.send('tx-data-push', localdata.wallet, transactions, next, tx)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleSettingsDataRequest(event) {
    try {
        event.sender.send('server-settings-data-push', config.server)
        let response = await services.getWallet(localdata.wallet.walletId)
        event.sender.send('settings-data-push', response.data)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleTokensDataRequest(event) {
    try {
        // Get user's related info on DVCToken & DVCTokenSale
        let response = await services.getTokensData(localdata.wallet.walletId)

        event.sender.send('tokens-data-push', response.data)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleBuyTokens(event, buyAmount) {
    try {
        if(hasEnoughFunds(buyAmount)) {
            let buyTokensResponse = await services.buyTokens(localdata.wallet.walletId, buyAmount)
            log.warn(
                `New purchase of ${buyAmount} ETH made .`,
                `Transaction hash: ${buyTokensResponse.data.transactionHash}`
            )
            // Update wallet balance and notify main window
            localdata.wallet.balance -= buyAmount
            services.persistData(localdata)
            utils.sendParent(event.sender, 'update-wallet-balance', localdata.wallet.balance)

            console.log('in main: ' + buyTokensResponse.data.logs[0].topics[0])

            event.sender.send('new-tokens-response', buyTokensResponse)

            // Get new tokens balance
            let response = await services.getTokensData(localdata.wallet.walletId)
            
            //We refresh the token renderer
            event.sender.send('tokens-data-push', response.data)

            //We refresh the main renderer
            utils.sendParent(event.sender, 'tokens-data-push', response.data)
        } else {
            utils.sendError(event.sender, new Error('The amount to spend is greater than your account balance'))
        }
    } catch(error) {
        utils.sendError(event.sender, error)
    }

}

async function handleSellTokens(event, sellAmount) {
    try {
        let sellTokensResponse = await services.sellTokens(localdata.wallet.walletId, sellAmount)
        log.warn(
            `New transaction of ${sellAmount} ETH made .`,
            `Transaction hash: ${sellTokensResponse.data.transactionHash}`
        )

        console.log("sell: " + sellTokensResponse.data.logs[0].topics[0])
    
        localdata.wallet.balance += parseInt(sellAmount)

        services.persistData(localdata)
        utils.sendParent(event.sender, 'update-wallet-balance', localdata.wallet.balance)

        event.sender.send('new-tokens-response', sellTokensResponse)

        // Get new tokens balance
        let response = await services.getTokensData(localdata.wallet.walletId)
        
        //We refresh the token renderer
        event.sender.send('tokens-data-push', response.data)

        //We refresh the main renderer
        utils.sendParent(event.sender, 'tokens-data-push', response.data)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}


async function handleRecoverWalletRequest(event, mnemonic) {
    try {
        let response = await services.recoverWallet(mnemonic)
        
        // Save recovered wallet
        localdata.wallet = response.data
        services.persistData(localdata)
        
        // Change to main window
        winManager.createMainWindow()
        log.warn(`Wallet with address ${localdata.wallet.publicAddress} was recovered using mnemonic`)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleChangeProfileRequest(event, settings) {
    try {
        let response = await services.changeProfile(localdata.wallet.walletId, settings.profile)
        
        // Update localdata
        localdata.wallet.firstname = settings.profile.firstname
        localdata.wallet.lastname = settings.profile.lastname
        localdata.wallet.email = settings.profile.email
        services.persistData(localdata)

        event.sender.send('change-settings-response', response.data)
        log.warn(`Profile data was changed`)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleChangeServerRequest(event, data) {
    config.server = data.server
    services.persistConfig(config)
    log.warn(`Server configuration changed to ${JSON.stringify(config.server)}`)
    event.sender.send('change-settings-response', {message: 'Server configuration changed'})
    if(data.init) {
        restartApp()
    }
}

async function handleNewTransactionRequest(event, tx) {
    tx.fromWalletId = localdata.wallet.walletId
    if(validateTransaction(tx)) {
        tx.message = utils.cleanTxMessage(tx.message)
        try { 
            let response = await services.submitTransaction(tx)            
            log.warn(`Transferred ${tx.value} ETH to ${tx.toAddr}`)
            
            localdata.wallet.balance -= tx.value
            services.persistData(localdata)
            
            event.sender.send('new-transaction-response', response.data)
        } catch(error) {
            utils.sendError(event.sender, error)
        }
    } else {
        utils.sendError(event.sender, new Error('Invalid transaction'))
    }
}

async function handleChangePageRequest(event, page) {
    try {
        let response = await services.getWalletTransactions(localdata.wallet.publicAddress, page)
        let transactions = response.data.transactions.data
        let next = response.data.transactions.next
        event.sender.send('change-page-response', {transactions, next})
    } catch (error) {
        utils.sendError(event.sender, error)
    }
}

async function handleRegisterRequest(event, password) {
    // Hash the password and store it on server and locally
    localdata.wallet.password = utils.hashMd5(password)
    try {
        let response = await services.registerPassword(localdata.wallet.walletId, localdata.wallet.password)
        
        // No need to continue storing mnemonic
        delete(localdata.wallet.mnemonic)
        services.persistData(localdata)
        
        winManager.createMainWindow()
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

async function handleChangePasswordRequest(event, settings) {
    var oldPass = utils.hashMd5(settings.password.old.trim())
    var newPass = utils.hashMd5(settings.password.new.trim())
    try {
        let response = await services.changePassword(localdata.wallet.walletId, oldPass, newPass)
        localdata.wallet.password = newPass
        services.persistData(localdata)
        log.warn('Password was changed')
        event.sender.send('change-settings-response', response.data)
    } catch(error) {
        utils.sendError(event.sender, error)
    }
}

function handleLoginRequest(event, password) {
    if(utils.hashMd5(password) === localdata.wallet.password) {
        winManager.createMainWindow()
    } else {
        utils.sendError(event.sender, new Error('Login failed'))
    }
}

function handleOtpSubmission(event, otp, action) {
    if(utils.validateOtp(otp, localdata.wallet.twoFactorAuthKey)) {
        // Close 2FA window
        winManager.closeWindow(event.sender.webContents)

        if(action == null ){
            action = ''
        }
        //We set up new IPC event with action
        ipcEvent = 'valid-otp' + action

        console.log(ipcEvent)
        // Notify parent window
        utils.sendParent(event.sender, ipcEvent)
    } else {
        utils.sendError(event.sender, new Error('Invalid OTP. Try again please.'))
    }
}

/* HELPERS */

/**
 * Compares the given amount to the current wallet's balance.
 * @param {number} amount
 * @returns {boolean} True if wallet's balance is greater that the given amount. False otherwise.
 */
function hasEnoughFunds(amount) {
    return localdata.wallet.balance > amount
}

/**
 * Restarts the electron application
 */
function restartApp() {
    app.relaunch()
    app.exit()
}

/**
 * Validates that the existence and type of the transaction's properties.
 * @param {*} tx Transaction to be validated
 */
function validateTransaction(tx) {
    // To address validation
    if(!tx.hasOwnProperty('toAddr') || !(typeof tx.toAddr === 'string') || tx.toAddr.length != 42) {
        return false
    }
    // Tx value validation
    else if(!tx.hasOwnProperty('value') || !(typeof tx.value === 'number') || tx.value === 0 || !hasEnoughFunds(tx.value)) {
        return false
    }
    // Message validation
    else if(!tx.hasOwnProperty('message') || !(typeof tx.message === 'string')) {
        return false
    }
    return true
}

/* MAIN PROCESS EVENTS */

ipcMain.on('open-settings-request', event => {
    winManager.createSettingsWindow()
})


ipcMain.on('open-tokens-request', event => {
    winManager.createTokensWindow()
})


ipcMain.on('open-twofactorauth-request', (event, otpAction) => {
    let window = winManager.createTwoFactorAuthWindow()
    window.webContents.on('did-finish-load', () => {
        window.webContents.send('change-otp-action', otpAction)
    })
})

ipcMain.on('tx-data-pull', handleTransactionsDataRequest)

ipcMain.on('new-transaction-request', handleNewTransactionRequest)

ipcMain.on('copy-address', event => {
    utils.copyAddress(localdata.wallet.publicAddress)
})

ipcMain.on('change-page-request', handleChangePageRequest)

ipcMain.on('login-request', handleLoginRequest)

ipcMain.on('register-request', handleRegisterRequest)

ipcMain.on('settings-data-pull', handleSettingsDataRequest)

ipcMain.on('new-buy-request', handleBuyTokens)

ipcMain.on('new-sell-request', handleSellTokens)

ipcMain.on('change-password-settings-request', handleChangePasswordRequest)

ipcMain.on('change-server-settings-request', handleChangeServerRequest)

ipcMain.on('change-profile-settings-request', handleChangeProfileRequest)

ipcMain.on('get-mnemonic-request', event => {
    let mnemonic = localdata.wallet.mnemonic ? Buffer.from(localdata.wallet.mnemonic, 'base64').toString('ascii') : ''
    event.sender.send('get-mnemonic-response', mnemonic)
})

ipcMain.on('recover-wallet-request', handleRecoverWalletRequest)

ipcMain.on('tokens-data-pull', handleTokensDataRequest)

ipcMain.on('otp-submission', handleOtpSubmission)

/* APP EVENTS */

app.on('ready', () => {
    log.warn('Starting app')
    // Set default config if none is available
    if(!cfgManager.existsConfig()) {
        cfgManager.saveConfig()
    }
    // Set menu, launch the app and parse any arguments passed
    if(!winManager.isAnyWindowOpen()) {
        utils.setAppMenu()
        initApp()
        sharedAddress = utils.parseArgs()
    }
})

app.on('window-all-closed', () => {
    log.warn('Closing app')
    app.quit()
})
