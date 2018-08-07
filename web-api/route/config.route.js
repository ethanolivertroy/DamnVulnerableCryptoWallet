const Router = require('express').Router
const { configCtrl } = require('../controllers')
const router = new Router()

router.get('/', getConfig)

function getConfig(req, res, next) {
    // Requests in the form /config?f=<filename>
    configCtrl.getConfigFromFile(req.query.f)
        .then(data => {
            res.json({config: data})
        })
        .catch(error => next(error))
}

module.exports = router
