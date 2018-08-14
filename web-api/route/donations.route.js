const Router = require('express').Router
const { donationsCtrl } = require('../controllers')
const router = new Router()

router.get('/:contractAddress', getDonationsData)
router.post('/:contractAddress/make-donation', makeDonation)

function getDonationsData(req, res, next) {
    donationsCtrl
        .getData(req.params.contractAddress, req.query.fromId)
        .then(data => res.json(data))
        .catch(error => next(error))
}

function makeDonation(req, res, next) {
    donationsCtrl
        .makeDonation(req.body.donationAmount, req.body.fromId, req.params.contractAddress)
        .then(tx => res.json(tx))
        .catch(error => next(error))
}

module.exports = router
