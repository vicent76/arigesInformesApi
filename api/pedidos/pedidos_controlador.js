const express = require('express')
const router = express.Router()
const pedidos_mysql = require('./pedidos_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await pedidos_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/cliente/:empresa/:codclien', async (req, res, next) => {
    try {
        let result = await pedidos_mysql.pedidos_cliente(req.params.codclien, req.params.empresa)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router