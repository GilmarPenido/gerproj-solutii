import { Firebird, options } from "../firebird";

const readBlob = (blobFn: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!blobFn || typeof blobFn !== "function") return resolve("");

        blobFn((err: any, name: any, stream: any) => {
            if (err) return reject(err);
            if (!stream) return resolve("");

            let data = "";
            stream.on("data", (chunk: Buffer) => {
                data += chunk.toString("latin1"); // Corrige acentos
            });
            stream.on("end", () => {
                resolve(data); // Converte para UTF-8
            });
            stream.on("error", reject);
        });
    });
};

async function findRecursoByName(nome: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Firebird.attach(options, (err: any, db: any) => {
            if (err) return reject(err);

            const q = `SELECT * FROM recurso WHERE UPPER(NOME_RECURSO) LIKE ? ORDER BY NOME_RECURSO`;
            db.query(q, [`%${(nome || "").toUpperCase()}%`], async (err: any, result: any) => {
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
                    await Promise.all(
                        result.map(async (row: any) => {
                            for (const key of Object.keys(row)) {
                                if (typeof row[key] === "function") {
                                    row[key] = await readBlob(row[key]);
                                } else if (typeof row[key] === "string") {
                                    row[key] = row[key]; // placeholder para conversões se necessário
                                }
                            }
                        })
                    );

                    db.detach();
                    resolve(result);
                } catch (e) {
                    db.detach();
                    reject(e);
                }
            });
        });
    });
}

export default findRecursoByName;
