const { BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const settings = require('./settings')

function _createWindow(settings, templateFilename, maximize = false) {
    let win = new BrowserWindow(settings)
    win.loadURL(_getTemplateURL(templateFilename))
    //win.webContents.openDevTools()
    win.once('ready-to-show', () => {
        if(maximize) {
            win.maximize()
        }
        win.show()
    })
    win.on('closed', () => {
        win = null
    })
    return win
}

function _getTemplateURL(templateName) {
    return url.format({
        pathname: path.join(__dirname, '..', 'templates', `${templateName}.html`),
        protocol: 'file',
        slashed: true
    })
}

function createMainWindow() {
    _createWindow(settings.mainWindow, 'index', true)
    // Close previous window
    if(BrowserWindow.getAllWindows().length != 1) {
        _getWindow(0).close()
    }
}

function createTwoFactorAuthWindow() {
    let winSettings = Object.assign({}, settings.twoFactorAuthWindow)
    winSettings.parent = _getWindow(1) || _getWindow(0)
    return _createWindow(winSettings, 'twofa')
}

/**
 * Launches modal windows that are children of the main window (such as
 * tokens and settings )
 * @param {string} templateFilename Name of the template file (without .html extension)
 */
function _createChildWindow(templateFilename) {
    let winSettings = Object.assign({}, settings.childWindow)
    winSettings.parent = _getWindow(0)
    _createWindow(winSettings, templateFilename)
}

function createSettingsWindow() {
    _createChildWindow('settings')
}

function createTokensWindow() {
    _createChildWindow('tokens')
}

function createServerSettingsWindow() {
    _createWindow(settings.serverSettingsWindow, 'server-settings')
}

/**
 * Launches windows before the main window, such as the login and register windows
 * @param {string} windowTitle Title for the window
 * @param {string} templateFilename Name of the template file (without .html extension)
 */
function _createAuthWindow(windowTitle, templateFilename) {
    let winSettings = Object.assign({}, settings.authWindow)
    winSettings.title = windowTitle
    
    _createWindow(winSettings, templateFilename)
    
    let windows = BrowserWindow.getAllWindows()
    if(windows.length != 1) {
        windows[0].close()
    }
}

function _getWindow(index) {
    return BrowserWindow.getAllWindows()[index]
}

function createLoginWindow() {
    _createAuthWindow('DVCW - Login', 'login')
}

function createRegisterWindow() {
    _createAuthWindow('DVCW - Register', 'register')
}

function isAnyWindowOpen() {
    return !!BrowserWindow.getAllWindows().length
}

/**
 * Closes the window that owns the given webContents
 * @param {*} webContents 
 */
function closeWindow(webContents) {
    BrowserWindow.fromWebContents(webContents).close()
}

module.exports = {
    createMainWindow,
    createLoginWindow,
    createRegisterWindow,
    createTwoFactorAuthWindow,
    createServerSettingsWindow,
    createSettingsWindow,
    createTokensWindow,
    isAnyWindowOpen,
    closeWindow
}
