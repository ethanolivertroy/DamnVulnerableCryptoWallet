const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const config = require('config')
const cors = require('cors')
const router = require('./route')

const server = express()
const LISTEN_PORT = config.port

server.use(bodyParser.text())
server.use(bodyParser.json())

// Only print logs during development
if(process.env.NODE_ENV === 'development') {
    server.use(morgan('dev'))
}

// CORS
server.use(cors({origin: true}))

// Set app routes
server.use('/', router.root)
server.use('/wallets', router.wallets)
server.use('/transactions', router.transactions)
server.use('/tokens', router.tokens)
server.use('/config', router.config)
server.use((err, req, res, next) => {
    if(!err.statusCode) {
        console.error(err)
        err.statusCode = 500
    }
    res.status(err.statusCode).json({error: err.message})
})
server.use((req, res) => {
    // Fallback response
    res.status(404).json({error: 'Not found'})
})

// Start server
server.listen(LISTEN_PORT, () => console.log(`Started DVCW API on localhost:${LISTEN_PORT}`))

module.exports = server // For testing purposes
