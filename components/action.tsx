'use server'

import SuportCallService from "@/services/suport-call"


export async function Chamados(session: any) {

    const calls: any = await SuportCallService(session?.user?.recurso)

    

    return (

        <main className='w-full flex justify-center'>

            <table className="table-auto border-collapse">

                <tr>
                    <th>Chamado</th>
                    <th>Assunto</th>
                    <th>Classificação</th>
                    <th>Data</th>
                    <th>Hora</th>
                </tr>
                {
                    calls.map((c: any) => (

                        <tr>
                            <td>{c.COD_CHAMADO}</td>
                            <td>{c.ASSUNTO_CHAMADO}</td>
                            <td>{c.COD_CLASSIFICACAO}</td>
                            <td>{c.DTENVIO_CHAMADO}</td>
                            <td>{c.HORA_CHAMADO}</td>
                        </tr>

                    ))

                }
            </table>

        </main>
    )








}