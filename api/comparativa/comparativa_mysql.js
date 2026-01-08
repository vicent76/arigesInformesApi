const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_comparativa: async (data, empresa) => {
        let conn = undefined;
        let empresavinculada = 0;
        let arr = [];
        let result = [];
        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg);

            //recuperamos el valor de spara1 empresavinculada
            let sql = "SELECT empresavinculada from spara1";
            let [param] = await conn.query(sql);
            if (param[0].empresavinculada) empresavinculada = param[0].empresavinculada
            // Primero establece el idioma español para los nombres de mes
            await conn.query("SET lc_time_names = 'es_ES'");

            if(data.codagent != data.hcodagent){    
              for(let i=data.codagent; i<=data.hcodagent ; i++){
                sql = recuperaSql(data, empresavinculada, i);
                 [result] = await conn.query(sql);
                 arr.push(...result);
              }
            } else {
               sql = recuperaSql(data, empresavinculada, data.codagent);
              [result] = await conn.query(sql);
              arr.push(...result);
            }
           
            await conn.end();
            return arr;
        } catch (error) {
            if (conn) {
                await conn.end();
            }
            throw error;
        }
    }

}

const recuperaSql = (data, empresavinculada, cod) => {
    return `
    SELECT
        '${data.nomEmpre}' AS nomempre,
        m.num_mes,
        MONTHNAME(STR_TO_DATE(m.num_mes, '%m')) AS nombre_mes,

        -- Datos año actual
        COALESCE(curr.anyo, YEAR('${data.dateFormat}')) AS anyo_actual,
        COALESCE(curr.total_baseimp1,0) AS total_baseimp1,
        COALESCE(curr.total_baseimp2,0) AS total_baseimp2,
        COALESCE(curr.total_baseimp3,0) AS total_baseimp3,
        COALESCE(curr.total_baseimp4,0) AS total_baseimp4,
        COALESCE(curr.total_baseimp5,0) AS total_baseimp5,
        COALESCE(curr.total_mes_agente,0) AS total_mes_agente,
        COALESCE(curr_total.total_mes,0) AS total_mes,
        ROUND(
            CASE 
                WHEN COALESCE(curr_total.total_mes,0) = 0 THEN 0
                ELSE COALESCE(curr.total_mes_agente,0) / COALESCE(curr_total.total_mes,0) * 100
            END,
            2
        ) AS porcentaje_agente,

        -- Datos año anterior
        COALESCE(prev.anyo_anterior, YEAR('${data.dateFormat}') - 1) AS anyo_anterior,
        COALESCE(prev.total_baseimp1,0) AS total_baseimp1_anterior,
        COALESCE(prev.total_baseimp2,0) AS total_baseimp2_anterior,
        COALESCE(prev.total_baseimp3,0) AS total_baseimp3_anterior,
        COALESCE(prev.total_baseimp4,0) AS total_baseimp4_anterior,
        COALESCE(prev.total_baseimp5,0) AS total_baseimp5_anterior,
        COALESCE(prev.total_mes_agente_anterior,0) AS total_mes_agente_anterior,
        COALESCE(prev_total.total_mes_anterior,0) AS total_mes_anterior,
        -- Porcentaje agente año anterior (sobre el total acumulado del mes del año anterior)
        ROUND(
            CASE 
                WHEN COALESCE(prev_total.total_mes_anterior,0) = 0 THEN 0
                ELSE COALESCE(prev.total_mes_agente_anterior,0) / COALESCE(prev_total.total_mes_anterior,0) * 100
            END,
            2
        ) AS porcentaje_agente_anterior,

        -- Agente
        ${cod} AS codagent,
        (SELECT sa.nomagent FROM sagent sa WHERE sa.codagent = ${cod} LIMIT 1) AS nomagent

    FROM
        -- Lista de meses
        (SELECT 1 AS num_mes UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
         SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) AS m

    -- Totales año actual por agente
    LEFT JOIN (
        SELECT
            MONTH(fecfactu) AS num_mes,
            YEAR(fecfactu) AS anyo,
            SUM(COALESCE(baseimp1,0)) AS total_baseimp1,
            SUM(COALESCE(baseimp2,0)) AS total_baseimp2,
            SUM(COALESCE(baseimp3,0)) AS total_baseimp3,
            SUM(COALESCE(baseimp4,0)) AS total_baseimp4,
            SUM(COALESCE(baseimp5,0)) AS total_baseimp5,
            SUM(
                COALESCE(baseimp1,0)+COALESCE(baseimp2,0)+COALESCE(baseimp3,0)+COALESCE(baseimp4,0)+COALESCE(baseimp5,0)
            ) AS total_mes_agente
        FROM scafac
        WHERE codagent = ${cod}
          AND fecfactu BETWEEN '${data.dateFormat}' AND '${data.hDateFormat}'
        GROUP BY MONTH(fecfactu), YEAR(fecfactu)
    ) AS curr ON curr.num_mes = m.num_mes

    -- Totales generales año actual
    LEFT JOIN (
        SELECT
            MONTH(fecfactu) AS num_mes,
            SUM(
                COALESCE(baseimp1,0)+COALESCE(baseimp2,0)+COALESCE(baseimp3,0)+COALESCE(baseimp4,0)+COALESCE(baseimp5,0)
            ) AS total_mes
        FROM scafac
        WHERE fecfactu BETWEEN '${data.dateFormat}' AND '${data.hDateFormat}'
        GROUP BY MONTH(fecfactu)
    ) AS curr_total ON curr_total.num_mes = m.num_mes

    -- Totales año anterior por agente
    LEFT JOIN (
        SELECT
            MONTH(fecfactu) AS num_mes,
            YEAR(fecfactu) AS anyo_anterior,
            SUM(COALESCE(baseimp1,0)) AS total_baseimp1,
            SUM(COALESCE(baseimp2,0)) AS total_baseimp2,
            SUM(COALESCE(baseimp3,0)) AS total_baseimp3,
            SUM(COALESCE(baseimp4,0)) AS total_baseimp4,
            SUM(COALESCE(baseimp5,0)) AS total_baseimp5,
            SUM(
                COALESCE(baseimp1,0)+COALESCE(baseimp2,0)+COALESCE(baseimp3,0)+COALESCE(baseimp4,0)+COALESCE(baseimp5,0)
            ) AS total_mes_agente_anterior
        FROM scafac
        WHERE codagent = ${cod}
          AND YEAR(fecfactu) = YEAR('${data.dateFormat}') - 1
        GROUP BY MONTH(fecfactu), YEAR(fecfactu)
    ) AS prev ON prev.num_mes = m.num_mes

    -- Totales generales año anterior
    LEFT JOIN (
        SELECT
            MONTH(fecfactu) AS num_mes,
            SUM(
                COALESCE(baseimp1,0)+COALESCE(baseimp2,0)+COALESCE(baseimp3,0)+COALESCE(baseimp4,0)+COALESCE(baseimp5,0)
            ) AS total_mes_anterior
        FROM scafac
        WHERE YEAR(fecfactu) = YEAR('${data.dateFormat}') - 1
        GROUP BY MONTH(fecfactu)
    ) AS prev_total ON prev_total.num_mes = m.num_mes

    ORDER BY m.num_mes;
    `;
}






 module.exports = clientes_mysql