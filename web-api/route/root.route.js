const Router = require('express').Router
const router = new Router()

router.get('/', getRoot)

function getRoot (req, res, next) {
    res.json({app: "DVCW"})
}

module.exports = router
