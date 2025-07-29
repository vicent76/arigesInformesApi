const express = require('express')
const router = express.Router()
const agentes_mysql = require('./agentes_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await agentes_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/:codagent/:empresa', async (req, res, next) => {
    try {
        let [result] = await agentes_mysql.agente(req.params.codagent, req.params.empresa)
        return res.json(result[0])
    } catch (error) {
        next(error)
    }
})


module.exports = router