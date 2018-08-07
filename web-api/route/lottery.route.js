const Router = require('express').Router
const { lotteryCtrl } = require('../controllers')
const router = new Router()

router.get('/:contractAddress', getLotteryData)
router.post('/:contractAddress/submit-bet', submitBet)

function getLotteryData(req, res, next) {
    lotteryCtrl
        .getData(req.params.contractAddress, req.query.fromId)
        .then(data => res.json(data))
        .catch(error => next(error))
}

function submitBet(req, res, next) {
    lotteryCtrl
        .submitBet(req.body.guess, req.body.betAmount, req.body.fromId, req.params.contractAddress)
        .then(result => res.json({result: result}))
        .catch(error => next(error))
}

module.exports = router
