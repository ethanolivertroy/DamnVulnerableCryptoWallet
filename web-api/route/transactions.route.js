const Router = require('express').Router
const { transactionsCtrl } = require('../controllers')
const router = new Router()

router.post('/new', newTransaction)

function newTransaction(req, res, next) {
    var response = null
    if(req.body.tx) {
        transactionsCtrl
            .makeTransaction(req.body.tx)
            .then(response => res.json(response))
            .catch(err => next(err))
    } else {
        let error = new Error('Invalid parameters')
        error.statusCode = 400
        next(error)
    }
}

module.exports = router
