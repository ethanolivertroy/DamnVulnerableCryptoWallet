const fs = require('fs')
const path = require('path')
let dataPath = require('electron').app.getPath('userData')
let defaultConfig = require('./default-config')

let filename = 'config.json'

function _readConfig() {
	return JSON.parse(fs.readFileSync(path.join(dataPath, filename)))
}

function existsConfig() {
	return fs.existsSync(path.join(dataPath, filename))
}

function saveConfig(newConfig = defaultConfig) {
	fs.writeFileSync(path.join(dataPath, filename), JSON.stringify(newConfig), 'utf8', err => {
        if(err) {
            console.error(`An error occurred while writing ${filename} to disk: ` + err)
        }
    })
}

function getConfig() {
    if(existsConfig()) {
        return _readConfig()
    } 
    else {
        return defaultConfig
    }
}

module.exports = {
	getConfig,
    saveConfig,
    existsConfig
}
