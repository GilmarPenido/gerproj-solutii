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
                    CAST(SOLICITACAO2_CHAMADO AS VARCHAR(32000)) AS  SOLICITACAO2_CHAMADO,
                    CAST(SOLICITACAO_CHAMADO AS VARCHAR(32000))  AS SOLICITACAO_CHAMADO
                FROM 
                    CHAMADO 
                        WHERE 
                    COD_RECURSO = ? 
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