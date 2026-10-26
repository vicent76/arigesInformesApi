const express = require('express')
const router = express.Router()
const ofertas_mysql = require('./ofertas_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await ofertas_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/:empresa/:codclien', async (req, res, next) => {
    try {
        let [result] = await ofertas_mysql.ofertas_cliente(req.params.codclien, req.params.empresa)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router