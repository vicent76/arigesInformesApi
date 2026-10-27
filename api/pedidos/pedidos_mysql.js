const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')
const { error } = require('winston')

const pedidos_mysql = {
    test: async () => {
        return 'OFERTAS TEST'
    },
    pedidos_cliente: async (codclien, empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql =
                `SELECT 
                    c.numpedcl AS numpedido,
                    c.fecpedcl AS fechapedido,
                    c.fecentre AS fechaentrega,
                    c.aceptado,
                    c.referenc AS referencia,
                    COALESCE(SUM(l.importel), 0) AS importe
                    FROM scaped c
                INNER JOIN sliped AS l ON l.numpedcl = c.numpedcl
                WHERE c.codclien = ${codclien}
                GROUP BY 1 `
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

module.exports = pedidos_mysql