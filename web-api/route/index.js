const root = require('./root.route')
const wallets = require('./wallets.route')
const transactions = require('./transactions.route')
const config = require('./config.route')
const tokens = require('./tokens.route')

module.exports = {
    root,
    wallets,
    transactions,
    config,
    tokens
}
