const express = require('express')
const router = express.Router()
const clientes_mysql = require('./clientes_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await clientes_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/:empresa', async (req, res, next) => {
    try {
        let result = await clientes_mysql.todos_clientes(req.params.empresa)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/buscar/:empresa/:cadena', async (req, res, next) => {
    try {
        let result = await clientes_mysql.buscar_clientes(req.params.empresa, req.params.cadena)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/codigo/:empresa/:codclien', async (req, res, next) => {
    try {
        let result = await clientes_mysql.cliente_codigo(req.params.empresa, req.params.codclien)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/telefonos/:empresa', async (req, res, next) => {
    try {
        let result = await clientes_mysql.todos_clientes_telefonos(req.params.empresa)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/telefonos/vencidos/:empresa', async (req, res, next) => {
    try {
        let result = await clientes_mysql.todos_clientes_telefonos_vencidos(req.params.empresa)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/telefonos/cliente/:empresa/:codclien', async (req, res, next) => {
    try {
        let result = await clientes_mysql.cliente_telefonos(req.params.empresa, req.params.codclien)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router