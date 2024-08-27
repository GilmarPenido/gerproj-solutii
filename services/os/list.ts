import { ChamadoLimitType, ChamadosType, STATUS_CHAMADO } from "@/models/chamados";
import { Firebird, options } from "../firebird";

export default (function OsService() {

    function list(chamado: string,  recurso: string, data: string): Promise<ChamadosType[]> {
        return new Promise((resolve, reject) => {

            Firebird.attach(options, function (err: any, db: any) {

                if (err) {
                    return reject(err)
                }

                // db = DATABASE
                db.query(`
                    SELECT
                    OBS, 
                    COD_OS,
                    DTINI_OS,
                    HRINI_OS,
                    HRFIM_OS
                        FROM OS 
                    where 
                        ${data ? 'DTINI_OS' : 'CHAMADO_OS'} = ? 
                            AND
                        CODREC_OS = ? `,
                    [data ? data : chamado, recurso], async function (err: any, result: any) {

                        db.detach();
                        if (err) {
                            console.log(err)
                            return reject(err)
                        }

                        result = result.map( (r: any) => { 
                            r.OBS = r.OBS.toString('utf8')
                            return r
                        })

                        return resolve(result)
                        // IMPORTANT: close the connection

                    });

            });
        })
    }

    function details(chamado: string): Promise<ChamadoLimitType[]> {
        return new Promise((resolve, reject) => {

            Firebird.attach(options, function (err: any, db: any) {

                if (err) {
                    return reject(err)
                }

                // db = DATABASE
                db.query(`
                    SELECT C.cod_chamado, O.cod_os, T.cod_tarefa, T.limmes_tarefa 
                        FROM
                    CHAMADO C
                        JOIN
                    OS O on O.chamado_os = C.cod_chamado and      C.cod_chamado = ?
                        JOIN
                    TAREFA T on T.cod_tarefa = O.codtrf_os`,
                    [chamado], async function (err: any, result: any) {

                        db.detach();

                        if (err) {
                            console.log(err)
                            return reject(err)
                        }

                        return resolve(result)
                        // IMPORTANT: close the connection

                    });

            });
        })
    }

    function insert(codChamado: string): Promise<any> {
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

                const newID: number = await new Promise((resolve, reject) => {

                    db.query(`SELECT MAX(COD_HISTCHAMADO) + 1 as ID FROM HISTCHAMADO`,
                        [], async function (err: any, res: any) {
                            if (err) {
                                db.detach()
                                return reject(err);
                            }
                            return resolve(res[0]['ID'])
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


                await new Promise((resolve, reject) => {

                    transaction.query(`
                        UPDATE CHAMADO SET STATUS_CHAMADO = ? WHERE COD_CHAMADO = ? AND STATUS_CHAMADO <> ?`,
                        [STATUS_CHAMADO["EM ATENDIMENTO"], codChamado, STATUS_CHAMADO.FINALIZADO], async function (err: any, result: any) {
                            if (err) {
                                db.detach()
                                transaction.rollback();
                                return reject(err)
                            }

                            return resolve(true)
                        });

                })

                await new Promise((resolve, reject) => {
                    transaction.query(`INSERT INTO HISTCHAMADO (COD_HISTCHAMADO, COD_CHAMADO, DATA_HISTCHAMADO, HORA_HISTCHAMADO, DESC_HISTCHAMADO) VALUES (?, ?, ?, ?, ?)`,
                        [
                            newID,
                            codChamado,
                            new Date().toLocaleString('pt-br', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replaceAll('/', '.').replaceAll(',', ''),
                            new Date().toLocaleString('pt-br', { hour: '2-digit', minute: '2-digit' }).replaceAll(':', ''),
                            STATUS_CHAMADO["EM ATENDIMENTO"]
                        ], async function (err: any, result: any) {

                            if (err) {
                                transaction.rollback();
                                db.detach()
                                return reject(err)
                            }

                            return resolve(true)


                        });
                })

                transaction.commit((err: Error) => {
                    if (err) {
                        transaction.rollback();
                        return reject(err)
                    }
                    else {
                        db.detach();
                        return resolve(true)
                    }

                });


            } catch (err) {
                db.detach();
                return reject(err)
            }
        }
    
        )}
    
    return {
            list, insert
        }


    }) ()