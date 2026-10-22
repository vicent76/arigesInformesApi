const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'CLIENTES TEST'
    },
    todos_clientes: async (empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `select * from sclien`
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

    buscar_clientes: async (empresa, cadena) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `select codclien, nomclien from sclien where nomclien like '%${cadena}%'`
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

    cliente_codigo: async (empresa, codclien) => {

        let conn;

        try {
            const cfg = await connector.empresa(empresa);
            conn = await mysql.createConnection(cfg);

            const sql = `
            SELECT *
            FROM sclien
            WHERE codclien = ?
        `;

            const [r] = await conn.query(sql, [codclien]);

            
            if (r.length === 0) {
                const error = new Error('No existe el cliente');
                error.status = 404;
                throw error;
            }

            return r[0];

        } catch (error) {
            throw error;

        } finally {
            if (conn) {
                await conn.end();
            }
        }
    },
    todos_clientes_telefonos: async (empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT 
                t.codclien,
                c.nomclien,
                t.IdTelefono,
                t.Observaciones,
                t.operador,
                o.nombre AS operadorNombre,
                t.modelo,
                m.descripcion AS modeloNombre,
                t.PlazosMeses,
                t.ImportePlazo,
                t.PlazosOrigen
                FROM sclientfno AS t
                LEFT JOIN sclien AS c ON c.codclien = t.codclien
                LEFT JOIN stfnooperador AS o ON o.codoperador = t.operador
                LEFT JOIN stfnomodel AS m ON m.codmodelo = t.modelo
                WHERE plazosorigen > 0 AND PlazosOrigen <> PlazosMeses ORDER BY 1, 3`
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

    todos_clientes_telefonos_vencidos: async (empresa) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT 
                t.codclien,
                c.nomclien,
                t.IdTelefono,
                t.Observaciones,
                t.operador,
                o.nombre AS operadorNombre,
                o.mesesRenovacion AS mesesRenovacion,
                t.modelo,
                m.descripcion AS modeloNombre,
                t.PlazosMeses,
                t.ImportePlazo,
                t.PlazosOrigen,
                DATE_ADD(t.fecharenove, INTERVAL o.mesesRenovacion MONTH) AS nuevaFechaRenovacion
                FROM sclientfno AS t
                LEFT JOIN sclien AS c ON c.codclien = t.codclien
                LEFT JOIN stfnooperador AS o ON o.codoperador = t.operador
                LEFT JOIN stfnomodel AS m ON m.codmodelo = t.modelo
                WHERE  t.fecharenove >= NOW() ORDER BY 1, 3`
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

    cliente_telefonos: async (empresa, codclien) => {
        let conn = undefined
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT 
                t.codclien,
                c.nomclien,
                t.IdTelefono,
                t.Observaciones,
                t.operador,
                o.nombre AS operadorNombre,
                t.modelo,
                m.descripcion AS modeloNombre,
                t.PlazosMeses,
                t.ImportePlazo,
                t.PlazosOrigen
                FROM sclientfno AS t
                LEFT JOIN sclien AS c ON c.codclien = t.codclien
                LEFT JOIN stfnooperador AS o ON o.codoperador = t.operador
                LEFT JOIN stfnomodel AS m ON m.codmodelo = t.modelo
                WHERE t.codclien = ${codclien} ORDER BY 3`
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
}

module.exports = clientes_mysql