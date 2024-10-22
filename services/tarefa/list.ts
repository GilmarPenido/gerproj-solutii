import { ChamadosType } from "@/models/chamados";
import { Firebird, options } from "../firebird";
import { TaskType } from "@/models/tarefa";

export default async function ListTaskService(recurso: string): Promise<TaskType[]> {
    

    return new Promise((resolve, reject) => {

        Firebird.attach(options, function (err: any, db: any) {

            if (err) {
                return reject(err)
            }

            // db = DATABASE
            db.query(`
                SELECT
                    PROJETO.RESPCLI_PROJETO,
                    TAREFA.FATURA_TAREFA,
                    TAREFA.COD_TAREFA,
                    TAREFA.NOME_TAREFA,
                    TAREFA.CODPRO_TAREFA,
                    TAREFA.DTSOL_TAREFA,
                    TAREFA.DTAPROV_TAREFA,
                    TAREFA.DTPREVENT_TAREFA,
                    TAREFA.HREST_TAREFA,
                    TAREFA.HRREAL_TAREFA,
                    TAREFA.STATUS_TAREFA,
                    CAST(TAREFA.OBS_TAREFA AS VARCHAR(32000)) AS  OBS_TAREFA
                FROM 
                    TAREFA 
                        JOIN
                    PROJETO ON PROJETO.COD_PROJETO = TAREFA.CODPRO_TAREFA
                        WHERE 
                    CODREC_TAREFA = ? 
                        AND 
                    STATUS_TAREFA = ?
                        AND
                    EXIBECHAM_TAREFA = ?`
                    ,
                [recurso, 1, 0], async function (err: any, result: any) {

                    db.detach();

                    if (err) {
                        return reject(err)
                    }
                    return resolve(result)

                });

        });
    })



}