const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'CLIENTES TEST'
    },
    todos_clientes: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from clientes`
            const [r] = await conn.query(sql)
            await conn.end()
            return r
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },

      cliente_codigo: async (codclien, empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
             let sql = `SELECT * FROM sclien 
            WHERE codclien = ${codclien}`
            const [r] = await conn.query(sql)
            if (r.length === 0) throw new Error("No existe el cliente")
            await conn.end()
            return r
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
       todos_clientes_telefonos: async (empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT codclien, idtelefono FROM sclientfno WHERE plazosorigen > 0 ORDER BY 1`
            const [r] = await conn.query(sql)
            await conn.end()
            return r
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    }
}

module.exports = clientes_mysql