 
const Router = require('express').Router
const { tokensCtrl } = require('../controllers')
const router = new Router()

router.get('/data', getTokensData)
router.post('/buy', buyTokens)
router.post('/sell', sellTokens)

function getTokensData(req, res, next) {
    tokensCtrl
        .getTokensData(req.query.fromId)
        .then(data => res.json(data))
        .catch(error => next(error))
}

function buyTokens(req, res, next) {
    tokensCtrl
        .buyTokens(req.body.amountToBuy, req.body.fromId)
        .then(tx => res.json(tx))
        .catch(error => next(error))
}

function sellTokens(req, res, next) {
    tokensCtrl
        .sellTokens(req.body.amountToSell, req.body.fromId)
        .then(tx => res.json(tx))
        .catch(error => next(error))
}

module.exports = router
