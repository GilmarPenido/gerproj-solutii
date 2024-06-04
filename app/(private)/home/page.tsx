"use client"
import { Suspense, useActionState, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"

import { Chamados } from "@/components/action"
import { ChamadosType } from "@/models/chamados"

export default function Home() {

    const { data: session } = useSession()
    const [calls, setCalls] = useState<ChamadosType[]>([])
    const [tab, setTab] = useState<'chamado' | 'os'>('chamado')

    useEffect(() => {

        fetch('/api/call?recurso=' + session?.user.recurso)
            .then(res => res.json()).then(res => {
                setCalls(res)
            })

    }, [])

    return (
        <main className="w-full h-full flex flex-col justify-center items-center">
            <section className="flex flex-row justify-center w-full margin-auto max-w-[800px]">
                <h2 className={tab === 'chamado' ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1" : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1"}>Chamado</h2>
                <h2 className={tab === 'os' ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1" : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1"}>OS</h2>
            </section>

            <div className="h-[32%] w-full flex justify-center">

                <main className='w-full flex justify-center'>

                    <table className="table-auto border-collapse">
                        <thead>

                            <tr>
                                <th>Chamado</th>
                                <th>Assunto</th>
                                <th>Classificação</th>
                                <th>Data</th>
                                <th>Hora</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                calls.map((c: any, k: number) => (

                                    <tr key={`${k}call`}>
                                        <td>{c.COD_CHAMADO}</td>
                                        <td>{c.ASSUNTO_CHAMADO}</td>
                                        <td>{c.COD_CLASSIFICACAO}</td>
                                        <td>{c.DTENVIO_CHAMADO}</td>
                                        <td>{c.HORA_CHAMADO}</td>
                                        <td>
                                            


                                        </td>
                                    </tr>

                                ))

                            }
                        </tbody>
                    </table>

                </main>

            </div>
        </main>
    )
}