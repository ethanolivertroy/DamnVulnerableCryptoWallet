const Router = require('express').Router
const { walletsCtrl, transactionsCtrl } = require('../controllers')
const router = new Router()

router.get('/count', countWallets)
router.get('/:address/transactions', queryWalletTransactions)
router.post('/new', createWallet)
router.post('/recover', recoverWallet)
router.get('/:walletId', queryWallet)
router.post('/:walletId/register-password', registerWalletPassword)
router.post('/:walletId/change-password', changeWalletPassword)
router.post('/:walletId/change-profile', changeWalletProfile)

function countWallets(req, res, next) {
    res.json({count : walletsCtrl.countWallets()})
}

function queryWalletTransactions(req, res, next) {
    transactionsCtrl
        .getWalletTransactions(req.params.address, req.query.page)
        .then(response => res.json(response))
        .catch(err => next(err))
}

function createWallet(req, res, next) {
    walletsCtrl
        .createWallet()
        .then(response => res.json(response))
        .catch(err => next(err))
}

function recoverWallet(req, res, next) {
    walletsCtrl
        .recoverWallet(req.body.mnemonic)
        .then(response => res.json(response))
        .catch(err => next(err))
}

function registerWalletPassword(req, res, next) {    
    var response = walletsCtrl.registerWalletPassword(req.params.walletId, req.body.password)
    if(response instanceof Error) {
        next(response)
    } else {
        res.json(response)
    }
}

function changeWalletPassword(req, res, next) {
    var data = null
    var response = null
    try {
        // hope data is an array ["oldPassword", "newPassword"]
        data = eval(req.body)
    } catch(error) {
        response = error
    }    
    if(!!data) {
        response = walletsCtrl.changeWalletPassword(req.params.walletId, data[0], data[1])
    } else {
        response = new Error('Invalid data')
        response.statusCode = 400
    }
    if(response instanceof Error) {
        next(response)
    } else {
        res.json(response)
    }
}

function queryWallet(req, res, next) {
    walletsCtrl
        .getWallet(req.params.walletId)
        .then(response => res.json(response))
        .catch(err => next(err))
}

function changeWalletProfile(req, res, next) {
    var response = walletsCtrl.changeWalletProfile(req.params.walletId, req.body)
    if(response instanceof Error) {
        next(response)
    } else {
        res.json(response)
    }
}

module.exports = router
