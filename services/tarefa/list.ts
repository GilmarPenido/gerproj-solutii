import { ChamadosType } from "@/models/chamados";
import { Firebird, options } from "../firebird";
import { TaskType } from "@/models/tarefa";
import iconv from "iconv-lite";

export default async function ListTaskService(recurso: string): Promise<TaskType[]> {

    // Função auxiliar para ler BLOB TEXT
    const readBlob = (blobFn: any): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!blobFn || typeof blobFn !== "function") return resolve("");

            blobFn((err: any, name: any, stream: any) => {
                if (err) return reject(err);
                if (!stream) return resolve("");

                let chunks: any[] = [];
                stream.on("data", (chunk: Buffer) => chunks.push(chunk));
                stream.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    resolve(iconv.decode(buffer, "ISO-8859-1").toString());
                });
                stream.on("error", reject);
            });
        });
    };

    return new Promise((resolve, reject) => {
        Firebird.attach(options, async (err: any, db: any) => {
            if (err) return reject(err);

            db.query(
                `
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
                    TAREFA.OBS_TAREFA,
                    CLIENTE.ACESSO_CLIENTE,
                    CLIENTE.NOME_CLIENTE
                FROM 
                    TAREFA 
                JOIN PROJETO ON PROJETO.COD_PROJETO = TAREFA.CODPRO_TAREFA
                INNER JOIN CLIENTE ON CLIENTE.COD_CLIENTE = PROJETO.CODCLI_PROJETO
                WHERE 
                    CODREC_TAREFA = ? 
                    AND STATUS_TAREFA IN (?, ?, ?)
                `,
                [recurso, 3, 2, 1],
                async (err: any, result: any) => {
                    if (err) {
                        db.detach();
                        return reject(err);
                    }

                    try {
                        // Ler BLOBs em paralelo
                        await Promise.all(
                            result.map(async (row: any) => {
                                if (typeof row.OBS_TAREFA === "function") {
                                    row.OBS_TAREFA = await readBlob(row.OBS_TAREFA);
                                } else if (row.OBS_TAREFA) {
                                    row.OBS_TAREFA = Buffer.from(row.OBS_TAREFA, "latin1").toString("utf8");
                                }

                                if (typeof row.ACESSO_CLIENTE === "function") {
                                    row.ACESSO_CLIENTE = await readBlob(row.ACESSO_CLIENTE);
                                } else if (row.ACESSO_CLIENTE) {
                                    row.ACESSO_CLIENTE = Buffer.from(row.ACESSO_CLIENTE, "latin1").toString("utf8");
                                }

                                // Converter campos VARCHAR/CHAR para UTF-8
                                row.NOME_CLIENTE = row.NOME_CLIENTE ? Buffer.from(row.NOME_CLIENTE, "latin1").toString("utf8").trim() : "";
                                row.NOME_TAREFA = row.NOME_TAREFA ? Buffer.from(row.NOME_TAREFA, "latin1").toString("utf8").trim() : "";
                                row.FATURA_TAREFA = row.FATURA_TAREFA ? Buffer.from(row.FATURA_TAREFA, "latin1").toString("utf8").trim() : "";
                                row.RESPCLI_PROJETO = row.RESPCLI_PROJETO ? Buffer.from(row.RESPCLI_PROJETO, "latin1").toString("utf8").trim() : "";
                            })
                        );

                        db.detach();
                        resolve(result);
                    } catch (e) {
                        db.detach();
                        reject(e);
                    }
                }
            );
        });
    });
}
