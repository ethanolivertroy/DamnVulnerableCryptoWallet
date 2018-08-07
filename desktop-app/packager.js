const packager = require('electron-packager')
const options = require('./package').build
packager(options)
    .then(appPaths => {
        console.log(`Ready! Find the packaged app at ${appPaths}`)
    })
    .catch(console.error)
