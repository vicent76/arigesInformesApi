const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')
const { error } = require('winston')

const empresas_mysql = {
    test: async () => {
        return 'AGENTES TEST'
    },
    agente: async (codagent, empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
             let sql = `SELECT * FROM sagent 
            WHERE codagent = ${codagent}`
            const [r] = await conn.query(sql)
            if (r.length === 0) throw new Error("No existe el agente")
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