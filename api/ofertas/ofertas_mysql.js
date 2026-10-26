const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')
const { error } = require('winston')

const empresas_mysql = {
    test: async () => {
        return 'AGENTES TEST'
    },
    ofertas_cliente: async (codclien, empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql =
                `SELECT 
                    c.numofert AS numoferta,
                    c.fecofert AS fechaoferta,
                    c.fecentre AS fechaentrega,
                    c.aceptado,
                    c.referenc AS referencia,
                    COALESCE(SUM(l.importel), 0) AS importe
                    FROM scapre c
                INNER JOIN slipre AS l ON l.numofert = c.numofert
                GROUP BY c.numofert  
                WHERE c.codclien = ${codclien}`
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

module.exports = empresas_mysql