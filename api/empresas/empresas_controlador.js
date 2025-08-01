const express = require('express')
const router = express.Router()
const empresas_mysql = require('./empresas_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await empresas_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/:codusu', async (req, res, next) => {
    try {
        result = await empresas_mysql.empresa(req.params.codusu)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router