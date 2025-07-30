const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_comparativa: async (data, empresa) => {
        let conn = undefined;
        
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg);

            // Primero establece el idioma español para los nombres de mes
            await conn.query("SET lc_time_names = 'es_ES'");

            let sql = recuperaSql(data);

            let [result] = await conn.query(sql);
            await conn.end();
            return result;

        } catch (error) {
            if (conn) {
                await conn.end();
            }
            throw error;
        }
    }

}

const recuperaSql = function(data) {
    let sql = '';
    if(!data.anyoAnterior) {
        sql = `SELECT 
              YEAR(sc.fecfactu) AS anyo,
              MONTH(sc.fecfactu) AS num_mes, 
              MONTHNAME(sc.fecfactu) AS nombre_mes, 
              SUM(COALESCE(sc.baseimp1, 0)) AS total_baseimp1, 
              SUM(COALESCE(sc.baseimp2, 0)) AS total_baseimp2, 
              SUM(COALESCE(sc.baseimp3, 0)) AS total_baseimp3, 
              SUM(COALESCE(sc.baseimp4, 0)) AS total_baseimp4, 
              SUM(COALESCE(sc.baseimp5, 0)) AS total_baseimp5, 
              SUM(COALESCE(sc.baseimp1, 0)) + 
              SUM(COALESCE(sc.baseimp2, 0)) + 
              SUM(COALESCE(sc.baseimp3, 0)) + 
              SUM(COALESCE(sc.baseimp4, 0)) + 
              SUM(COALESCE(sc.baseimp5, 0)) AS total_mes_agente, 
              tmp.total_mes AS total_mes, 
              ROUND(( 
                (SUM(COALESCE(sc.baseimp1, 0)) + 
                 SUM(COALESCE(sc.baseimp2, 0)) + 
                 SUM(COALESCE(sc.baseimp3, 0)) + 
                 SUM(COALESCE(sc.baseimp4, 0)) + 
                 SUM(COALESCE(sc.baseimp5, 0))) / NULLIF(tmp.total_mes, 0) 
              ) * 100, 2) AS porcentaje_agente 
            FROM scafac AS sc 
            LEFT JOIN ( 
              SELECT 
                MONTH(sc.fecfactu) AS num_mes, 
                SUM(COALESCE(sc.baseimp1, 0)) + 
                SUM(COALESCE(sc.baseimp2, 0)) + 
                SUM(COALESCE(sc.baseimp3, 0)) + 
                SUM(COALESCE(sc.baseimp4, 0)) + 
                SUM(COALESCE(sc.baseimp5, 0)) AS total_mes 
              FROM scafac AS sc 
              WHERE sc.fecfactu BETWEEN '${data.dateFormat}' AND  '${data.hDateFormat}'
              GROUP BY MONTH(sc.fecfactu) 
            ) AS tmp ON MONTH(sc.fecfactu) = tmp.num_mes 
            WHERE sc.codagent = ${data.codagent} 
              AND sc.fecfactu BETWEEN  '${data.dateFormat}' AND '${data.hDateFormat}'  
            GROUP BY num_mes, nombre_mes, tmp.total_mes 
            ORDER BY num_mes`
    } else {
                        sql = `SELECT
                        m.num_mes,
                        MONTHNAME(STR_TO_DATE(m.num_mes, '%m')) AS nombre_mes,

                        COALESCE(curr.anyo, YEAR(DATE_SUB('${data.dateFormat}', INTERVAL 0 YEAR))) AS anyo_actual,
                        COALESCE(curr.total_baseimp1, 0) AS total_baseimp1,
                        COALESCE(curr.total_baseimp2, 0) AS total_baseimp2,
                        COALESCE(curr.total_baseimp3, 0) AS total_baseimp3,
                        COALESCE(curr.total_baseimp4, 0) AS total_baseimp4,
                        COALESCE(curr.total_baseimp5, 0) AS total_baseimp5,
                        COALESCE(curr.total_mes_agente, 0) AS total_mes_agente,

                        COALESCE(curr_total.total_mes, 0) AS total_mes,
                        ROUND(
                            COALESCE(curr.total_mes_agente, 0) / NULLIF(COALESCE(curr_total.total_mes, 0), 0) * 100, 2
                        ) AS porcentaje_agente,

                        COALESCE(prev.anyo_anterior, YEAR(DATE_SUB('${data.dateFormat}', INTERVAL 1 YEAR))) AS anyo_anterior,
                        COALESCE(prev.total_baseimp1, 0) AS total_baseimp1_anterior,
                        COALESCE(prev.total_baseimp2, 0) AS total_baseimp2_anterior,
                        COALESCE(prev.total_baseimp3, 0) AS total_baseimp3_anterior,
                        COALESCE(prev.total_baseimp4, 0) AS total_baseimp4_anterior,
                        COALESCE(prev.total_baseimp5, 0) AS total_baseimp5_anterior,
                        COALESCE(prev.total_mes_agente_anterior, 0) AS total_mes_agente_anterior,
                        
                        COALESCE(prev_total.total_mes_anterior, 0) AS total_mes_anterior,
                        COALESCE(
                            ROUND(
                            ((curr.total_mes_agente - prev.total_mes_agente_anterior) / NULLIF(prev.total_mes_agente_anterior, 0)) * 100,
                            2
                            ),
                            0
                        ) AS porcentaje_agente_anterior

                        FROM
                        (SELECT 1 AS num_mes UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
                        SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) AS m

                        LEFT JOIN
                        (
                        SELECT
                            YEAR(fecfactu) AS anyo,
                            MONTH(fecfactu) AS num_mes,
                            SUM(COALESCE(baseimp1,0)) AS total_baseimp1,
                            SUM(COALESCE(baseimp2,0)) AS total_baseimp2,
                            SUM(COALESCE(baseimp3,0)) AS total_baseimp3,
                            SUM(COALESCE(baseimp4,0)) AS total_baseimp4,
                            SUM(COALESCE(baseimp5,0)) AS total_baseimp5,
                            SUM(COALESCE(baseimp1,0)) + SUM(COALESCE(baseimp2,0)) + SUM(COALESCE(baseimp3,0)) +
                            SUM(COALESCE(baseimp4,0)) + SUM(COALESCE(baseimp5,0)) AS total_mes_agente
                        FROM scafac
                        WHERE codagent = ${data.codagent}
                            AND fecfactu BETWEEN '${data.dateFormat}' AND '${data.hDateFormat}'
                        GROUP BY YEAR(fecfactu), MONTH(fecfactu)
                        ) AS curr ON curr.num_mes = m.num_mes

                        LEFT JOIN
                        (
                        SELECT
                            MONTH(fecfactu) AS num_mes,
                            SUM(COALESCE(baseimp1,0)) + SUM(COALESCE(baseimp2,0)) + SUM(COALESCE(baseimp3,0)) +
                            SUM(COALESCE(baseimp4,0)) + SUM(COALESCE(baseimp5,0)) AS total_mes
                        FROM scafac
                        WHERE fecfactu BETWEEN '${data.dateFormat}' AND '${data.hDateFormat}'
                        GROUP BY MONTH(fecfactu)
                        ) AS curr_total ON curr_total.num_mes = m.num_mes

                        LEFT JOIN
                        (
                        SELECT
                            YEAR(fecfactu) AS anyo_anterior,
                            MONTH(fecfactu) AS num_mes,
                            SUM(COALESCE(baseimp1,0)) AS total_baseimp1,
                            SUM(COALESCE(baseimp2,0)) AS total_baseimp2,
                            SUM(COALESCE(baseimp3,0)) AS total_baseimp3,
                            SUM(COALESCE(baseimp4,0)) AS total_baseimp4,
                            SUM(COALESCE(baseimp5,0)) AS total_baseimp5,
                            SUM(COALESCE(baseimp1,0)) + SUM(COALESCE(baseimp2,0)) + SUM(COALESCE(baseimp3,0)) +
                            SUM(COALESCE(baseimp4,0)) + SUM(COALESCE(baseimp5,0)) AS total_mes_agente_anterior
                        FROM scafac
                        WHERE codagent = ${data.codagent}
                            AND fecfactu BETWEEN DATE_SUB('${data.dateFormat}', INTERVAL 1 YEAR) AND DATE_SUB('${data.hDateFormat}', INTERVAL 1 YEAR)
                        GROUP BY YEAR(fecfactu), MONTH(fecfactu)
                        ) AS prev ON prev.num_mes = m.num_mes

                        LEFT JOIN
                        (
                        SELECT
                            MONTH(fecfactu) AS num_mes,
                            SUM(COALESCE(baseimp1,0)) + SUM(COALESCE(baseimp2,0)) + SUM(COALESCE(baseimp3,0)) +
                            SUM(COALESCE(baseimp4,0)) + SUM(COALESCE(baseimp5,0)) AS total_mes_anterior
                        FROM scafac
                        WHERE fecfactu BETWEEN DATE_SUB('${data.dateFormat}', INTERVAL 1 YEAR) AND DATE_SUB('${data.hDateFormat}', INTERVAL 1 YEAR)
                        GROUP BY MONTH(fecfactu)
                        ) AS prev_total ON prev_total.num_mes = m.num_mes`;
    }
    return sql;
}

module.exports = clientes_mysql