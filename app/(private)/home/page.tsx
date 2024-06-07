'use client';

import { FormEvent, Suspense, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { ChamadosType } from "@/models/chamados"
import { VscDebugStart } from "react-icons/vsc";
import { PiPauseDuotone } from "react-icons/pi";
import { TbCalendarCheck } from "react-icons/tb";
import { ImStop } from "react-icons/im";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import Modal from "@/components/modal";
import { BsNodePlusFill } from "react-icons/bs";
import Loading from "@/components/loading";
import { ostring } from "zod";

export default function Home() {

    const { data: session } = useSession()
    const [calls, setCalls] = useState<ChamadosType[]>([])
    const [tab, setTab] = useState<'chamado' | 'os'>('chamado')
    const [isOpenModal, setOpenModal] = useState(false)
    const [description, setDescription] = useState('')
    const [selectedCall, setSelectedCall] = useState<ChamadosType|null>(null)
    const [modalStandby, setModalStandby] = useState(false)
    const [textArea, setTextArea] = useState('')
    const [loadingOs, setLoadingOs] = useState(false)
    const [listOs, setListOs] = useState([])

    const [ additionalOs, setAdditionalOS] = useState(false) 

    const [hours, setHours] = useState({
        initial: '',
        final: ''
    })

    function insertOs(event: FormEvent) {
        event.preventDefault()
        console.log(event)
    }

    function updateInitialHour(hr: string) {
        setHours(hours => ({
            ...hours,
            initial: hr
        }))

    }

    function updateFinalHour(hr: string) {
        setHours(hours => ({
            ...hours,
            final: hr
        }))
    }

    

    function changeSelectedCall(chamado: ChamadosType) {
        setSelectedCall(() => chamado)

    }

    function getTimeOs(horaIni: string, horaFim: string) {

        let totalHours = 0

        let minutesIni = parseInt(horaIni.substring(2,4))
        minutesIni =  minutesIni == 0 ? 0 : 60 - minutesIni
        let minutesFim = parseInt(horaFim.substring(2,4))

        totalHours = minutesIni == 0 ? 0 : -1 

        let totalMinutes = minutesIni + minutesFim

        if(totalMinutes >= 60) {
            totalHours += 1
            totalMinutes -= 60
        }

        let hoursIni = parseInt(horaIni.substring(0,2))
        let hoursFim = parseInt(horaFim.substring(0,2))

        totalHours += (hoursFim - hoursIni)

        return `0${totalHours}`.slice(-2) + ':' + `0${totalMinutes}`.slice(-2)
    }

    function totalTimesOs() {

        return listOs.reduce( (accum: any, current: any) => {


                let time = getTimeOs(current.HRINI_OS, current.HRFIM_OS)

                if(accum === 0) {


                    return time
                }
                


                let [hours, minutes] = time.split(":")

                let [hoursAcum, minutesAccum] = accum.split(":")


                let hoursTotal = parseInt(hours) + parseInt(hoursAcum)
                let minutesTotal = parseInt(minutes) + parseInt(minutesAccum)


                if(minutesTotal >= 60) {

                    minutesTotal -= 60
                    hoursTotal += 1
                }


                return `0${hoursTotal}`.slice(-2) + ':' + `0${minutesTotal}`.slice(-2) 


        },0)

    }

    async function getAllOs() {

        setAdditionalOS(false)
        setLoadingOs(true)

        let result = await fetch('/api/os/list?chamado=' + selectedCall?.COD_CHAMADO)
        .then(res => res.json())
        .then(res => res)
        .catch(() => {
            setLoadingOs(false)
        })
        .finally(() => {
            setLoadingOs(false)
        })

        if(!result)  { 
            setListOs([])    
            return 
        };


        if(result.length === 0) {
            setAdditionalOS(true)
        } else {
            
        }

        setListOs(result)


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

        setOpenModal(false)

    }

    async function standbyCall(chamado: ChamadosType|null, descricao: string) {
        if (!chamado) return;
        
        let result = await fetch('/api/call/stadby', {
            method: 'POST',
            body: JSON.stringify({
                codChamado: chamado.COD_CHAMADO,
                descricao
            })
        })

        .then(res => res.json())
        .then(res => res)

        if(!result) return;

        getCalls()

        setModalStandby(false)

    }

    function openDescriptions(chamado: ChamadosType) {
        let desc = chamado.SOLICITACAO_CHAMADO.trim()
        desc = desc.substring(1, desc.length - 1)

        setDescription(chamado.SOLICITACAO2_CHAMADO)
        setOpenModal(true)
    }

    useEffect(() => {

        if(!selectedCall) return;

        getAllOs()

    }, [selectedCall])

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

            {
                modalStandby &&
                <Modal isOpen={modalStandby} setOpenModal={setModalStandby} title='StandBy' action={() => standbyCall(selectedCall, textArea)}>
                    <label>Descrição</label>
                    <textarea rows={5} className="w-full border-zinc-300 border-2 outline-none rounded-lg resize-none p-2" />


                    <label>Horas</label>

                    <div className="w-full flex flex-row justify-between gap-8 pt-2">
                        <input className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]" onChange={event => updateInitialHour(event.target.value)} value={hours.initial} type="time" />
                        <input className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]" onChange={event => updateFinalHour(event.target.value)} value={hours.final} type="time" />
                    </div>
                        
                    
                    
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
                                    <td className="text-center  p-2">{c?.DTENVIO_CHAMADO?.replace('-', ' ')}</td>
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
                                                <PiPauseDuotone title="STANDBY" onClick={_ => setModalStandby(true)} style={{cursor: 'pointer'}} className="text-yellow-500 hover:text-yellow-300"  size={18} />
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

            {
                loadingOs ?  <Loading /> : 
            
                selectedCall &&
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

                        
                        <tbody className="max-h-[300px] overflow-auto text-xs">
                            {
                            listOs.map( (os: any) => 
                                <tr key={os.COD_OS} className="odd:bg-zinc-100 h-[20px] border-zinc-300 border-b-2">
                                    <td className="p-2 text-center">{os.COD_OS.toLocaleString('pt-br')}</td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center">{new Date(os.DTINI_OS).toLocaleString('pt-br', {year:'numeric', month: '2-digit', day: '2-digit'})}</td>
                                    <td className="p-2 text-center">{os.HRINI_OS.replace(/(\d{2})(\d{2})/g, '$1:$2')}</td>
                                    <td className="p-2 text-center">{os.HRFIM_OS.replace(/(\d{2})(\d{2})/g, '$1:$2')}</td>
                                    <td className="p-2 text-center">{getTimeOs(os.HRINI_OS, os.HRFIM_OS)}</td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center"></td>
                                </tr>
                            )
                            }

                            {
                                additionalOs ?
                            <form onSubmit={insertOs}>

                            
                                <tr className="odd:bg-zinc-100 h-[46px] border-zinc-300 border-b-2 p-2">
                                    <td></td>
                                    <td></td>
                                    <td><input className="w-full h-8 p-2 outline-none border-2 border-zinc-200 rounded-md" type="date" /></td>
                                    <td><input className="w-full h-8 p-2 outline-none border-2 border-zinc-200 rounded-md" type="time" /></td>
                                    <td><input className="w-full h-8 p-2 outline-none border-2 border-zinc-200 rounded-md" type="time" /></td>
                                    <td></td>
                                    <td></td>
                                    <td><button className="w-full h-8 px-2 outline-none bg-cyan-800 text-white text-bold rounded-md">Salvar</button></td>
                                </tr>  
                            </form>                    
                                :
                            <tr>
                                <td colSpan={8}>
                                    <BsNodePlusFill onClick={_=>setAdditionalOS(true)} size={26} className="relative cursor-pointer text-emerald-500 top-[-15px] float-right"/>
                                </td>
                            </tr>
                            }
                        </tbody>
                        <tfoot>
                        <tr className="bg-yellow-200 text-xs">
                                <td colSpan={4} className="p-2 text-center"></td>
                                <td colSpan={4} className="p-2 text-right text-orange-800">total: <b>{totalTimesOs()} hrs</b></td>
                            </tr>
                        </tfoot>
                    </table>

                </section>
         
            }
            

           
        </main>
    )
}