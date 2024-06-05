'use client';

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { ChamadosType } from "@/models/chamados"
import { VscDebugStart } from "react-icons/vsc";
import { PiPauseDuotone } from "react-icons/pi";
import { TbCalendarCheck } from "react-icons/tb";
import { ImStop } from "react-icons/im";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import Modal from "@/components/modal";


export default function Home() {

    const { data: session } = useSession()
    const [calls, setCalls] = useState<ChamadosType[]>([])
    const [tab, setTab] = useState<'chamado' | 'os'>('chamado')
    const [isOpenModal, setOpenModal] = useState(false)
    const [description, setDescription] = useState('')
    const [selectedCall, setSelectedCall] = useState<ChamadosType|null>(null)

    function changeSelectedCall(chamado: ChamadosType) {
        setSelectedCall(() => chamado)

    } 

    async function getCalls() {

        let result = await fetch('/api/call/list?recurso=' + session?.user.recurso)
        .then(res => res.json())
        .then(res => res)

        if(!result) return;

        setCalls(result)

    }

    async function startCall(chamado: ChamadosType) {

        let result = await fetch('/api/call/start?codChamado=' + chamado.COD_CHAMADO)
        .then(res => res.json())
        .then(res => res)

        if(!result) return;

        getCalls()

        setOpenModal(false)

    }

    function openDescriptions(chamado: ChamadosType) {
        
        let desc = chamado.SOLICITACAO_CHAMADO.trim()
        desc = desc.substring(1, desc.length - 1)

        setDescription(chamado.SOLICITACAO2_CHAMADO)
        setOpenModal(true)
    }

    useEffect(() => {

        if(!session) return;

        getCalls()

    }, [session])

    return (
        <main className="w-full h-full flex flex-col justify-center items-center p-4">


            {
                isOpenModal &&
                <Modal isOpen={isOpenModal} setOpenModal={setOpenModal} title='Descrição'>
                    <p className="my-4 text-blueGray-500 text-lg leading-relaxed" dangerouslySetInnerHTML={{__html: description}}>
                    </p>
                </Modal>
            }
            

            <header className="flex flex-row w-full justify-around p-4">

                <p className="text-blue-500" >{session?.user.name}</p>
                <p className="bg-zync-500 text-blue-500 rounded-lg cursor-pointer" onClick={() => signOut()}>Logout</p>

            </header>



            <section className="flex flex-row justify-center w-full margin-auto max-w-[800px]">
                <h2 className={tab === 'chamado' ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1" : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1"}>Chamado</h2>
                <h2 className={tab === 'os' ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1" : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1"}>OS</h2>
            </section>


            <section className='w-full sm:text-sm text-xs pt-6 overflow-auto'>

                <table className="table-auto border-collapse border-spacing-x-1 w-full min-w-full">
                    <thead>

                        <tr className="text-white bg-cyan-800">
                            <th>Número</th>
                            <th>Assunto</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th className="w-[130px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            calls.map((c: any, k: number) => (

                                <tr key={`${k}call`} className={ "odd:bg-zinc-100 p-4" + (c?.COD_CHAMADO === selectedCall?.COD_CHAMADO ? " !bg-indigo-200 outline-2" : "") }  onClick={() => changeSelectedCall(c)}>
                                    <td className="text-center p-2">{c?.COD_CHAMADO?.toLocaleString('pt-br')}</td>
                                    <td className="text-start  p-2">{c?.ASSUNTO_CHAMADO}</td>
                                    <td className="text-center  p-2">{c?.DTENVIO_CHAMADO.replace('-', ' ')}</td>
                                    <td className="text-center  p-2">{c?.STATUS_CHAMADO }</td>
                                    <td className="text-center flex flex-row gap-4 sm:gap-2 sm:flex-nowrap flex-wrap  sm:justify-between justify-center  max-w-[130px] p-2">

                                            {
                                                c.STATUS_CHAMADO !== "EM ATENDIMENTO" &&
                                                <VscDebugStart onClick={ _=>startCall(c)} title="EM ATENDIMENTO" style={{cursor: 'pointer'}} className="text-green-600 hover:text-green-400"  size={18}/>
                                            }
                                            
                                            {   
                                                c.STATUS_CHAMADO !== "STANDBY"  &&
                                                c.STATUS_CHAMADO !== "AGUARDANDO VALIDACAO"  &&
                                                c.STATUS_CHAMADO !== "ATRIBUIDO" &&
                                                <PiPauseDuotone title="STANDBY" style={{cursor: 'pointer'}} className="text-yellow-500 hover:text-yellow-300"  size={18} />
                                            }
                                            
                                            {
                                                    c.STATUS_CHAMADO !== "AGUARDANDO VALIDACAO"  &&
                                                    c.STATUS_CHAMADO !== "ATRIBUIDO" &&
                                                <ImStop title="AGUARDANDO VALIDAÇÃO" style={{cursor: 'pointer'}} className="text-red-700 hover:text-red-500"  size={18}/>
                                            }
                                            
                                            {
                                                c.STATUS_CHAMADO !== "ATRIBUIDO" &&  
                                                <TbCalendarCheck title="FINALIZADO" style={{cursor: 'pointer'}} className="text-orange-500 hover:text-orange-300" size={18} /> 
                                            }
                                            
                                            <HiOutlineClipboardDocumentList onClick={() => openDescriptions(c)} title="Detalhamento" style={{cursor: 'pointer'}} className="text-fuchsia-700 hover:text-fuchsia-500" size={18} />
                                    
                                        
                                    
                                    </td>                                    
                                    
                                </tr>

                            ))

                        }
                    </tbody>
                </table>

            </section>

            <hr  className="w-full pt-4"/>
            <section className='w-full sm:text-sm text-xs pt-6 overflow-auto'>
                <table className="table-auto border-collapse border-spacing-x-1 w-full min-w-full">
                    <thead className="text-white bg-cyan-800">
                        <tr>
                            <th>Código</th>
                            <th>Tarefa</th>
                            <th>Data</th>
                            <th>Hora Início</th>
                            <th>Hora Fim</th>
                            <th>Tempo</th>
                            <th>Projeto</th>
                            <th>Cliente</th>
                        </tr>
                    </thead>
                    <tbody className="bg-zinc-100 max-h-[300px] overflow-auto text-xs">
                        <tr className="h-[20px]">
                            <td className="p-2 text-center">1</td>
                            <td className="p-2 text-center">Configuracao protheus</td>
                            <td className="p-2 text-center">25/06/2024</td>
                            <td className="p-2 text-center">10:00</td>
                            <td className="p-2 text-center">12:00</td>
                            <td className="p-2 text-center">02:00</td>
                            <td className="p-2 text-center">Atualizacao Protheus</td>
                            <td className="p-2 text-center">GV-Pneus</td>
                        </tr>
                    </tbody>
                    <tfoot>
                    <tr className="bg-yellow-200 text-xs">
                            <td colSpan={6} className="p-2 text-center"></td>
                            <td colSpan={2} className="p-2 text-right text-orange-800">tempo tarefa: <b>04:00 hrs</b></td>
                        </tr>
                    </tfoot>
                </table>

            </section>

           
        </main>
    )
}