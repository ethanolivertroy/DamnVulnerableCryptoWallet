const root = require('./root.route')
const wallets = require('./wallets.route')
const transactions = require('./transactions.route')
const lottery = require('./lottery.route')
const donations = require('./donations.route')
const config = require('./config.route')

module.exports = {
    root,
    wallets,
    transactions,
    lottery,
    donations,
    config
}
