import { ChamadosType } from "@/models/chamados";
import { Firebird, options } from "../firebird";

export default async function SuportCallService(recurso: string): Promise<ChamadosType[]> {
    

    return new Promise((resolve, reject) => {

        Firebird.attach(options, function (err: any, db: any) {

            if (err) {
                return reject(err)
            }

            // db = DATABASE
            db.query(`
                SELECT
                    COD_CHAMADO,
                    ASSUNTO_CHAMADO,
                    COD_CLASSIFICACAO,
                    DTENVIO_CHAMADO,
                    HORA_CHAMADO,
                    STATUS_CHAMADO,
                    CODTRF_CHAMADO,
		            EMAIL_CHAMADO,
                    COD_RECURSO,
                    CAST(SOLICITACAO_CHAMADO AS VARCHAR(32000))  AS SOLICITACAO_CHAMADO,
                    CAST(CLIENTE.ACESSO_CLIENTE AS VARCHAR(32000)) AS  ACESSO_CLIENTE,
                    CLIENTE.NOME_CLIENTE
                    
                FROM 
                    CHAMADO
                        INNER JOIN
                    CLIENTE ON CLIENTE.COD_CLIENTE = CHAMADO.cod_cliente
                        WHERE 
                    CHAMADO.COD_RECURSO = ? 
                        AND 
                    STATUS_CHAMADO <> ?`,
                [recurso, 'FINALIZADO'], async function (err: any, result: any) {

                    db.detach();

                    if (err) {
                        return reject(err)
                    }

                    return resolve(result)
                    // IMPORTANT: close the connection

                });

        });
    })
}