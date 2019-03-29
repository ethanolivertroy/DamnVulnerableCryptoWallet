const config = require('config')
const bip39 = require('bip39')
const crypto = require('crypto')
const hdkey = require('ethereumjs-wallet/hdkey')
const speakeasy = require('speakeasy')
const db = require('../data')
const models = require('../models')
const getWeb3 = require('../data/web3')
let web3 = getWeb3()

async function createWallet(userMnemonic) {
    let wallet = Object.assign({}, models.wallet)
    let mnemonic = userMnemonic || config.defaultMnemonic
    let seed = bip39.mnemonicToSeedHex(mnemonic)
    
    wallet.publicAddress = hdkey.fromMasterSeed(Buffer.from(seed, 'hex'))
                                .derivePath(`${config.derivationPath}/${config.walletIndex}`)
                                .getWallet()
                                .getChecksumAddressString()
    
    wallet.walletId = crypto.createHash('sha1').update(seed + config.walletIndex).digest('hex')
    
    let existingWallet = db.getWalletById(wallet.walletId)
    if(!existingWallet) {
        wallet.walletIndex = config.walletIndex
        wallet.seedEncrypted = _encrypt(seed + config.walletIndex)
        // Generate and set key for two factor auth
        wallet.twoFactorAuthKey = _generateTwoFactorKey()
        // Save wallet in DB
        db.saveWallet(wallet)
    } else {        
        // Delete wallet password so the user changes it
        delete(existingWallet.password)
        db.deleteWalletPassword(existingWallet.walletId)
        // Copy data from existing wallet
        wallet = Object.assign({}, existingWallet)        
    }
    wallet.mnemonic = (new Buffer(mnemonic)).toString('base64')
    wallet.balance = await getWalletBalance(wallet.publicAddress)

    return wallet
}

async function getWalletBalance(publicAddress) {
    let balance = await web3.eth.getBalance(publicAddress)
    return parseFloat(web3.utils.fromWei(balance, 'ether'))
}

async function recoverWallet(mnemonic) {
    if(bip39.validateMnemonic(mnemonic))
        return createWallet(mnemonic)
    else {
        let error = new Error('Invalid mnemonic')
        error.statusCode = 400
        throw error
    }
}

function registerWalletPassword(walletId, newPassword) {
    try {
        let currentPassword = db.getWalletPassword(walletId)
        if(validateWalletId(walletId) && _validatePassword(newPassword) && !currentPassword) {
            db.registerWalletPassword(walletId, newPassword)
            return {message: 'Password successfully registered'}        
        } else {
            let error = new Error('Invalid data')
            error.statusCode = 400
            return error
        }
    }
    catch(error) {
        error.statusCode = 500
        return error
    }
}

function changeWalletPassword(walletId, oldPassword, newPassword) {
    if(validateWalletId(walletId) && _validatePassword(newPassword)) {
        try {
            let currentPassword = db.getWalletPassword(walletId)
            if(!!currentPassword && currentPassword.length > 0 && oldPassword === currentPassword && currentPassword != newPassword ) {                
                db.registerWalletPassword(walletId, newPassword)
                return {message: 'Password successfully changed'}
            } else {
                let error = new Error('Cannot change password')
                error.statusCode = 400
                return error
            }
        } catch(error) {
            return error
        }
    } else {
        let error = new Error('Invalid data')
        error.statusCode = 400
        return error
    }
}

function changeWalletProfile(walletId, profile) {
    // Not validating walletId here
    if(!_isEmpty(profile) && _validateEmail(profile.email)) {
        try {
            db.updateWalletProfile(walletId, profile)
            let response = {
                message: 'Profile successfully updated',
                data: db.getWalletById(walletId)
            }
            return response
        } catch(error) {            
            error.statusCode = 500
            return error
        }
    } else {
        let error = new Error('Invalid data')
        error.statusCode = 400
        return error
    }
}

function _isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

async function getWallet(walletId) {
    if(validateWalletId(walletId)) {    
        let wallet = db.getWalletById(walletId)
        if(!wallet) {
            let error = new Error('Unknown ID')
            error.statusCode = 404
            throw error
        }
        wallet.balance = await getWalletBalance(wallet.publicAddress)
        return wallet        
    } else {
        let error = new Error('Invalid data')
        error.statusCode = 400
        throw error
    }
}

function getWalletPrivateKey(seedEncrypted) {
    let seedDecrypted = _decrypt(seedEncrypted)
    // Remove wallet index at the end of the seed (see how seed is encrypted in createWallet)
    seedDecrypted = seedDecrypted.slice(0, -1)
    return hdkey
        .fromMasterSeed(Buffer.from(seedDecrypted, 'hex'))
        .derivePath(`${config.derivationPath}/${config.walletIndex}`)
        .getWallet()
        .getPrivateKey()
}

function _generateTwoFactorKey() {
    return speakeasy.generateSecret({length: 20}).base32
}

function _validateEmail(email) {
    if(!!email) {
        return /^\w+([+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())
    } else return true
}

function _validatePassword(password) {
    return !!password && password.trim().length > 0
}

function validateWalletId(id) {
    // Only hex characters allowed
    return !!id && /^[0-9a-f]+$/i.test(id.trim().toLowerCase())
}

function _encrypt(data) {
    let cipher = crypto.createCipher('rc4', _fromDoubleBase64(config.secureKey))
    let crypted = cipher.update(data, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
}

function _decrypt(data) {
    let decipher = crypto.createDecipher('rc4', _fromDoubleBase64(config.secureKey))
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted 
}

function _fromDoubleBase64(data) {
    return Buffer.from(Buffer.from(data, 'base64').toString('ascii'), 'base64').toString('ascii')
}

module.exports = {
    createWallet,
    validateWalletId,
    "countWallets": db.countWallets,
    registerWalletPassword,
    changeWalletPassword,
    recoverWallet,
    changeWalletProfile,
    getWallet,
    getWalletBalance,
    getWalletPrivateKey
}
