import { ChamadosType } from "@/models/chamados";
import { Firebird, options } from "../firebird";
import { TarefaType } from "@/models/tarefa";

export default async function ListTaskService(recurso: string): Promise<TarefaType[]> {
    

    return new Promise((resolve, reject) => {

        Firebird.attach(options, function (err: any, db: any) {

            if (err) {
                return reject(err)
            }

            // db = DATABASE
            db.query(`
                SELECT
                    COD_TAREFA,
                    NOME_TAREFA,
                    CODPRO_TAREFA,
                    DTSOL_TAREFA,
                    DTAPROV_TAREFA,
                    DTPREVENT_TAREFA,
                    HREST_TAREFA,
                    STATUS_TAREFA,
                    CAST(OBS_TAREFA AS VARCHAR(32000)) AS  OBS_TAREFA
                FROM 
                    CHAMADO 
                        WHERE 
                    CODREC_TAREFA = ? 
                        AND 
                    STATUS_CHAMADO <> ?
                        AND
                    EXIBECHAM_TAREFA = ?`
                    ,
                [recurso, 4, 0], async function (err: any, result: any) {

                    db.detach();

                    if (err) {
                        return reject(err)
                    }
                    return resolve(result)

                });

        });
    })



}