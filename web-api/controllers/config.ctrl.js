const fs = require('fs')

function getConfigFromFile(file) {
    var errorMessage = 'Cannot read configuration'
    return new Promise((resolve, reject) => {
        if(!file) {
            let error = new Error(errorMessage)
            error.statusCode = 400
            reject(error)
        }
        // Check file extension
        else if(file.endsWith('.json')) {
            // JSON file, read it from disk and parse it
            fs.readFile(`./config/${file}`, 'utf8', (err, data) => {
                if(err) {
                    let error = new Error(errorMessage)
                    error.statusCode = 404
                    reject(error)
                }
                else {
                    resolve(JSON.parse(data))
                }
            })
        } else {
            // Not a JSON file, reject
            let error = new Error(errorMessage)
            error.statusCode = 403
            reject(error)
        }
    })
}

module.exports = {
    getConfigFromFile
}