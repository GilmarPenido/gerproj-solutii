import { ChamadosType, STATUS_CHAMADO, STATUS_CHAMADO_COD } from "@/models/chamados";
import { Firebird, options } from "../firebird";

export default async function UpdateOsService(
    codOs: any,
    description: string,
    date: string,
    startTime: string,
    endTime: string,
    ): Promise<boolean> {


    return new Promise(async (resolve, reject) => {

        let db: any = null

        try {

            db = await new Promise((resolve, reject) => {
                Firebird.attach(options, (err: any, db: any) => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(db)
                })
            })

            
   
            const transaction: any = await new Promise((resolve, reject) => {
                db.transaction(Firebird.ISOLATION_READ_COMMITTED, (err: any, transaction: any) => {
                    if (err) {
                        db.detach()
                        return reject(err)
                    }
                    return resolve(transaction)
                })
            })


            console.log( `UPDATE OS  SET DTINI_OS= ?, HRINI_OS= ?, HRFIM_OS= ?, OBS= ? WHERE COD_OS = ?`, [
                new Date(`${date} 00:00`).toLocaleString('pt-br', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replaceAll('/', '.').replaceAll(',', ''),
                startTime.replace(":", ""),
                endTime.replace(":", ""),
                description,
                codOs
            ])

            
            let success = await new Promise((resolve, reject) => {
                transaction.query(
                `UPDATE OS  SET DTINI_OS= ?, HRINI_OS= ?, HRFIM_OS= ?, OBS= ? WHERE COD_OS = ?`,
                    [
                        new Date(`${date} 00:00`).toLocaleString('pt-br', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replaceAll('/', '.').replaceAll(',', ''),
                        startTime.replace(":", ""),
                        endTime.replace(":", ""),
                        description,
                        codOs
                    ], async function (err: any, result: any) {

                        if (err) {
                            
                            transaction.rollback();
                            db.detach()
                            return reject(err)
                        }

                        return resolve(true)

                        
                    });
            })

            /**
             * COD_OS, CODTRF_OS, DTINI_OS, HRINI_OS, HRFIM_OS, STATUS (1 - LEVANTAMENTO, 2 - DESENVOLVIMENTO, 3 - TESTE, 4 - CONCLUIDO), ?, PRODUTIVO_OS ('SIM'), CODREC_OS, PRODUTIVO2_OS ('SIM'), RESPCLI_OS, REMDES_OS ('NAO'), ABONO_OS ('NAO'), DESLOC_OS (0000), OBS (BLOB), DTINC_OS (DATA DE INCLUSAO), FATURADO_OS, PERC_OS (100), COMP_OS (MES VIGENTE), VALID_OS, VRHR_OS, NUM_OS, CHAMADO_OS
             */

            console.log("10")

            success = await transaction.commit((err: Error) => {
                if (err) {
                    console.log(err)
                    transaction.rollback();
                    return reject(err)
                }
                else {
                    db.detach();
                    return resolve(true)
                }

            });

            db.detach()
            console.log("passou por aqui")
            resolve(true)


        } catch (err) {
            console.log(err)
            db.detach();
            return reject(err)
        }
    })
}