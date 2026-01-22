import { Firebird, options } from "../firebird";

const readBlob = (blobFn: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!blobFn || typeof blobFn !== "function") return resolve("");

        let settled = false;
        try {
            blobFn((err: any, name: any, stream: any) => {
                if (settled) return;
                if (err) {
                    settled = true;
                    return reject(err);
                }
                if (!stream || typeof stream.on !== "function") {
                    settled = true;
                    return resolve("");
                }

                let data = "";
                stream.on("data", (chunk: Buffer) => {
                    data += chunk.toString("latin1"); // Corrige acentos
                });
                stream.on("end", () => {
                    if (settled) return;
                    settled = true;
                    resolve(data); // Converte para UTF-8
                });
                stream.on("error", (e: any) => {
                    if (settled) return;
                    settled = true;
                    reject(e);
                });
            });
        } catch (e) {
            if (!settled) {
                settled = true;
                reject(e);
            }
        }
    });
};

async function findChamado(stats: string, client: string, consultant: string, cursor: number = 0): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Firebird.attach(options, (err: any, db: any) => {
            if (err) return reject(err);

            const q = `
            SELECT FIRST 10 SKIP ? chamado.*,tarefa.sla_tarefa, cliente.cod_cliente, cliente.nome_cliente FROM
            chamado
            LEFT JOIN
            tarefa ON (chamado.codtrf_chamado = tarefa.cod_tarefa)
            LEFT JOIN
            projeto ON (projeto.cod_projeto = tarefa.codpro_tarefa)
            LEFT JOIN
            cliente ON (cliente.cod_cliente = projeto.codcli_projeto)
            WHERE 
                UPPER(STATUS_CHAMADO) LIKE ? 
                AND cliente.cod_cliente LIKE ? 
                AND chamado.COD_RECURSO LIKE ? 
                AND chamado.data_chamado > '2024.01.10 00:00'
                ORDER BY chamado.COD_CHAMADO desc`;

            db.query(q, [
                cursor,
                `%${(stats || "").toUpperCase()}%`,
                `%${(client || "")}%`,
                `%${(consultant || "")}%`
            ], async (err: any, result: any) => {

                if (err) {
                    db.detach();
                    return reject(err);
                }

                if (!result || !result.length) {
                    db.detach();
                    return resolve([]);
                }

                try {
                    // Converter BLOBs e campos texto codificados
                    for (const row of result) {
                        for (const key of Object.keys(row)) {
                            if (typeof row[key] === "function") {
                                try {
                                    row[key] = await readBlob(row[key]);
                                } catch (e) {
                                    // fallback to empty string on blob read error
                                    row[key] = "";
                                }
                            } else if (typeof row[key] === "string") {
                                row[key] = row[key]; // placeholder para conversões se necessário
                            }
                        }
                    }

                    db.detach();
                    resolve(result);
                } catch (e) {
                    db.detach();
                    console.log('passou aqui no catch', e);
                    reject(e);
                }
            });
        });
    });
}

export default findChamado;
