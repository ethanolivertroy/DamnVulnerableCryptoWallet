const crypto = require('crypto')
const { Menu, clipboard } = require('electron')
const log = require('electron-log')
const speakeasy = require('speakeasy')
const services = require('./services')
const menuTemplate = require('./menu')

/**
 * Makes a request to the configured backend server to check if it is online.
 * @returns {boolean} True if backend server is online. False otherwise.
 */
exports.isServerOnline = () => {
    return services
        .getRoot()
        .then(function (response){return true})
        .catch(function (error) { return false})
}

/**
 * Hashes data using the MD5 algorithm
 * @param {*} data Data to be hashed
 * @returns {string} MD5 hash
 */
exports.hashMd5 = data => {
    return crypto.createHash('md5').update(data).digest('hex')
}

exports.cleanTxMessage = message => {
    return message ? message : ''
}

/**
 * Logs the error and sends the error message to the specified sender
 * @param {*} sender The sender that will receive the error message
 * @param {Error} error Error instance
 * @param {boolean} logError Indicates if logging is required. Defaults to false.
 */
exports.sendError = (sender, error, logError = false) => {
    if(logError) {
        log.error(error)
    }    
    sender.send('error-push', error.message)
}

exports.sendParent = (sender, channel, data = {}) => {
    sender.browserWindowOptions.parent.webContents.send(channel, data)
}

/**
 * Checks whether the given OTP is valid or not.
 * @param {number} otp
 * @param {*} key
 * @returns {boolean} true for a valid OTP. False otherwise.
 */
exports.validateOtp = (otp, key) => {
    let data = {
        secret: key,
        encoding: 'base32',
        token: otp
    }
    return speakeasy.totp.verify(data)
}

/**
 * Builds and sets the application menu from a template
 */
exports.setAppMenu = () => {
    Menu.setApplicationMenu(
        Menu.buildFromTemplate(menuTemplate)
    )
}

/**
 * Parses the arguments used to launch the electron app, looking for a 
 * valid protocol handler in the form of 'dvcw://<public-address>/'.
 * @returns {string} address parsed in args. Null if no address is found.
 */
exports.parseArgs = () => {
    let args = process.argv.slice(1)
    if(args && args.length && /^dvcw:\/\/0x[0-9a-f]{40}\/$/i.test(args[0].toLowerCase())) {
        return args[0].substr(7, 42)
    }
    else return null
}

exports.copyAddress = address => {
    clipboard.writeText(`dvcw://${address}`)
}

exports.isPasswordSet = wallet => {
    return wallet && wallet.password && wallet.password.length
}
