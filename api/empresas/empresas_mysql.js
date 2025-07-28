const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')
const { error } = require('winston')

const empresas_mysql = {
    test: async () => {
        return 'EMPRESAS TEST'
    },
    empresa: async (codusu) => {
        let conn = undefined
        try {
            let cfg = await connector.usu()
            conn = await mysql.createConnection(cfg)
             let sql = `SELECT codempre, nomempre, nomresum, ariges FROM empresasariges 
            WHERE codempre NOT IN
                (
                    SELECT codempre FROM usuarioempresasariges WHERE codusu = ${codusu}
                )`
            const [r] = await conn.query(sql)
            if (r.length === 0) throw new error("No hay empresas de trabajo")
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