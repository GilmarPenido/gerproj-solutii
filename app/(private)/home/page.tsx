"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChamadosType, STATUS_CHAMADO } from "@/models/chamados";
import { VscDebugStart } from "react-icons/vsc";
import { PiPauseDuotone } from "react-icons/pi";
import { TbCalendarCheck } from "react-icons/tb";
import { ImStop } from "react-icons/im";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { IoCloseCircleOutline } from "react-icons/io5";
import Modal from "@/components/modal";
import Loading from "@/components/loading";

import { LuPointer } from "react-icons/lu";
import   iconv from 'iconv-lite';
import { CiEdit } from "react-icons/ci";

export default function Home() {
    const { data: session } = useSession();
    const [calls, setCalls] = useState<ChamadosType[]>([]);
    const [tab, setTab] = useState<"chamado" | "os">("chamado");
    const [isOpenModal, setOpenModal] = useState(false);
    const [description, setDescription] = useState("");
    const [selectedCall, setSelectedCall] = useState<ChamadosType | null>(null);
    const [selectedOs, setSelectedOs] = useState<any | null>(null);
   
    const [modalStandby, setModalStandby] = useState(false);
    const [modalTarefa, setModalTarefa] = useState(false);
    const [modalEditOS, setModalEditOS] = useState(false);
    const [textArea, setTextArea] = useState("");
    const [loadingOs, setLoadingOs] = useState(false);
    const [listOs, setListOs] = useState([]);
    const [hours, setHours] = useState({
        initial: "",
        final: "",
    });

    const [selectedTask, setSelectedTask] = useState<any>(null);

    const [tasks, setTasks] = useState([])
    const [descriptionText,setDescriptionText] = useState('')

    const [date, setDate] = useState(new Date().toISOString().substr(0, 10));

    const [directionOrder, setDirectionOrder] = useState<'asc' | 'desc'>('desc')
    const [selectedDate, setSelectedDate] = useState<string>('')
    /*  const columns: GridColDef[] = [
         {
             field: 'COD_CHAMADO',
             headerName: 'Número',
             width: 80
         },
         {
             field: 'ASSUNTO_CHAMADO',
             headerName: 'Assunto',
             width: 450,
             editable: true,
         },
         {
             field: 'DTENVIO_CHAMADO',
             headerName: 'Data',
             width: 150,
             editable: true,
         },
         {
             field: 'STATUS_CHAMADO',
             headerName: 'Status',
             type: 'number',
             width: 150,
             editable: true,
         },
         {
             field: 'action',
             headerName: 'Actions',
             description: 'This column has a value getter and is not sortable.',
             sortable: false,
             width: 150,
             renderCell: ( { row }) => (
                 <div className="text-center flex flex-row  gap-2 flex-nowrap justify-between p-2">
                     
                     {row?.STATUS_CHAMADO !== "EM ATENDIMENTO" && (
                         <VscDebugStart
                             onClick={(_) => startCall(row)}
                             title="EM ATENDIMENTO"
                             style={{ cursor: "pointer" }}
                             className="text-green-600 hover:text-green-400"
                             size={18}
                         />
                     )}
 
                     {row?.STATUS_CHAMADO !== "STANDBY" &&
                         row?.STATUS_CHAMADO !== "AGUARDANDO VALIDACAO" &&
                         row?.STATUS_CHAMADO !== "ATRIBUIDO" && (
                             <PiPauseDuotone
                                 title="STANDBY"
                                 onClick={(_) => setModalStandby(true)}
                                 style={{ cursor: "pointer" }}
                                 className="text-yellow-500 hover:text-yellow-300"
                                 size={18}
                             />
                         )}
 
                     {row?.STATUS_CHAMADO !== "AGUARDANDO  VALIDACAO" &&
                         row?.STATUS_CHAMADO !== "ATRIBUIDO" && (
                             <ImStop
                                 title="AGUARDANDO VALIDAÇÃO"
                                 style={{ cursor: "pointer" }}
                                 className="text-red-700 hover:text-red-500"
                                 size={18}
                             />
                         )}
 
                     {row?.STATUS_CHAMADO !== "ATRIBUIDO" && (
                         <TbCalendarCheck
                             title="FINALIZADO"
                             style={{ cursor: "pointer" }}
                             className="text-orange-500 hover:text-orange-300"
                             size={18}
                         />
                     )}
 
                     <HiOutlineClipboardDocumentList
                         onClick={() => openDescriptions(row)}
                         title="Detalhamento"
                         style={{ cursor: "pointer" }}
                         className="text-fuchsia-700 hover:text-fuchsia-500"
                         size={18}
                     />
                 </div>
             ),
         },
     ]; */

    function insertOs(event: FormEvent) {
        event.preventDefault();
        console.log(event);
    }

    function updateInitialHour(hr: string) {
        setHours((hours) => ({
            ...hours,
            initial: hr,
        }));
    }

    function changeSelectedDate(event: ChangeEvent<HTMLInputElement>) {
        setSelectedCall(null)
        setSelectedDate(event?.target?.value)
        getAllOs(event?.target?.value);

    }

    function updateFinalHour(hr: string) {
        setHours((hours) => ({
            ...hours,
            final: hr,
        }));
    }

    function changeSelectedCall(chamado: ChamadosType) {
        setSelectedCall(() => chamado);
    }

    function validRangeTime() {

        let [hoursEnd, minutesEnd]: any = hours.final.split(":")
        let [hoursStart, minutesStart]: any = hours.initial.split(":")

        hoursEnd = parseInt(hoursEnd)
        minutesEnd = parseInt(minutesEnd)

        hoursStart = parseInt(hoursStart)
        minutesStart = parseInt(minutesStart)


        if(hoursStart > hoursEnd) {
            return false
        }

        if(hoursStart === hoursEnd && minutesStart > minutesEnd) {
            return false
        }

        return true



    }

    function validTime(time: string) {

        let [hours, minutes]: any = time.split(":")

        minutes = parseInt(minutes)
        
        if(minutes === 0 || minutes % 15 === 0 ) {

            minutes = `${minutes}`.padStart(2, '0')

            return `${hours}:${minutes}`
        }

        if (minutes < 5) {

            minutes = 0
        }
            
        else if (minutes < 15) {

            minutes = 15
        }
            
        else if (minutes < 30) {

            minutes = 30
        }
            
        else {

            minutes = 45
        }
                
        

        minutes = `${minutes}`.padStart(2, '0')
        return `${hours}:${minutes}`

    }

    function getTimeOs(horaIni: string, horaFim: string) {
        let totalHours = 0;

        let minutesIni = parseInt(horaIni.substring(2, 4));
        minutesIni = minutesIni == 0 ? 0 : 60 - minutesIni;
        let minutesFim = parseInt(horaFim.substring(2, 4));

        totalHours = minutesIni == 0 ? 0 : -1;

        let totalMinutes = minutesIni + minutesFim;

        if (totalMinutes >= 60) {
            totalHours += 1;
            totalMinutes -= 60;
        }

        let hoursIni = parseInt(horaIni.substring(0, 2));
        let hoursFim = parseInt(horaFim.substring(0, 2));

        totalHours += hoursFim - hoursIni;

        return `0${totalHours}`.slice(-2) + ":" + `0${totalMinutes}`.slice(-2);
    }

    function totalTimesOs() {
        return listOs.reduce((accum: any, current: any) => {
            let time = getTimeOs(current.HRINI_OS, current.HRFIM_OS);

            if (accum === 0) {
                return time;
            }

            let [hours, minutes] = time.split(":");

            let [hoursAcum, minutesAccum] = accum.split(":");

            let hoursTotal = parseInt(hours) + parseInt(hoursAcum);
            let minutesTotal = parseInt(minutes) + parseInt(minutesAccum);

            if (minutesTotal >= 60) {
                minutesTotal -= 60;
                hoursTotal += 1;
            }

            return `0${hoursTotal}`.slice(-2) + ":" + `0${minutesTotal}`.slice(-2);
        }, 0);
    }

    async function getAllOs(date: string = '') {
        setLoadingOs(true);

        let result = await fetch(
            "/api/os/list", {
            headers: {
                'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify({
                chamado: selectedCall?.COD_CHAMADO,
                data: date,
                recurso: session?.user.recurso
            })
        }
        )
            .then((res) => res.json())
            .then((res) => res)
            .catch(() => {
                setLoadingOs(false);
            })
            .finally(() => {
                setLoadingOs(false);
            });

        if (!result) {
            setListOs([]);
            return;
        }

        setListOs(result);
    }

    async function getCalls() {
        let result = await fetch("/api/call/list?recurso=" + session?.user.recurso)
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        setCalls(result);
    }


    async function changeStatus(chamado: ChamadosType, status: string) {

        if(chamado.CODTRF_CHAMADO === null) {


            let selectedTasks: any = await fetch("/api/call/task", {
                method: "POST",
                body: JSON.stringify( { chamado } )
            }).then(response => response.json())
            
            setSelectedTask(null);
            setTasks(selectedTasks);
            setModalTarefa(true);
            return;
        }


        let result = await fetch(
            "/api/call/change-status?codChamado=" + chamado.COD_CHAMADO + "&status=" + status
        )
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        setOpenModal(false);
        getCalls();
    }

    async function startCall(chamado: ChamadosType) {

        if(chamado.CODTRF_CHAMADO === null) {


            let selectedTasks: any = await fetch("/api/call/task", {
                method: "POST",
                body: JSON.stringify( { chamado } )
            }).then(response => response.json())
            
            setSelectedTask(null);
            setTasks(selectedTasks);
            setModalTarefa(true);
            return;
        }


        let result = await fetch(
            "/api/call/start?codChamado=" + chamado.COD_CHAMADO
        )
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        setOpenModal(false);
        getCalls();
    }

    async function standbyCall(chamado: ChamadosType | null) {

        if((!hours.initial) || (!hours.final) || (!date)) {
            alert("Selecione uma data e hora inicial/final");
            return;
        }


        if( hours.initial > hours.final) {

            alert("Hora inicial não pode ser maior que a hora final!")
            return;

        }

        if(description.trim() === "") {

            console.log(description)

            alert("Descrição do chamado é obrigatória!")
            return;
        }

     
        if (!chamado) {
            alert("Selecione um chamado!");
            return;
        }

        let task = await fetch("/api/get-task", {
            method: "POST",
            body: JSON.stringify({
                COD_CHAMADO: selectedCall?.COD_CHAMADO
            })
        })
            .then((res) => res.json())
            .then((res) => res);

        let result = await fetch("/api/call/standby", {
            method: "POST",
            body: JSON.stringify({
                chamado,
                description,
                date,
                startTime: hours.initial,
                endTime: hours.final,
                state: 'STANDBY',
                task
            })
        })
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        getCalls();
        getAllOs();        
        setModalStandby(false);
    }

    function openDescriptions(chamado: ChamadosType) {
        let desc = chamado.SOLICITACAO_CHAMADO.trim();
        desc = desc.substring(1, desc.length - 1);

        setDescription(chamado.SOLICITACAO2_CHAMADO);
        setOpenModal(true);
    }

    async function updateChamadoTarefa() {
        setLoadingOs(true);


        if(!selectedTask) {
            alert("Selecione uma tarefa!")
            return;
        }


        let result = await fetch("/api/insert-task", {
            method: "POST",
            body: JSON.stringify({
                COD_CHAMADO: selectedCall?.COD_CHAMADO,
                COD_TAREFA: selectedTask 
            })
        })
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        if(selectedCall) {
            let call = {
                ...selectedCall,
                CODTRF_CHAMADO: selectedTask
            }
            await startCall(call)
        }


        setModalTarefa(false);

        setLoadingOs(false);

    }

    useEffect(() => {
        if (!selectedCall) return;

        getAllOs();
    }, [selectedCall]);

    useEffect(() => {
        if (!session) return;

        getCalls();
    }, [session]);

    function orderTo(field: string) {

        let asc = calls[0].COD_CHAMADO

        let newList = calls.sort((a: any, b: any) => {
            if (a[field] < b[field]) {
                return -1;
            } else if (a[field] > b[field]) {
                return 1;
            } else {
                return 0;
            }
        });

        if (newList[0].COD_CHAMADO === asc) {
            newList = newList.reverse();
        }


        setCalls([...newList]);

    }

    async function updateCall(codChamado: string, data: string, horaIni: string, horaFim: string, state: string) 
    {
        let result = fetch("/api/call/update", {
            method: "POST",
            body: JSON.stringify({
                codChamado,
                data,
                horaIni,
                horaFim,
                state
            }),
        })
            .then((res) => res.json())
            .then((res) => res);

    }

    function handleEdit(os: any) {



        setSelectedOs(os);

        setHours({
            initial: os.HRINI_OS.replace(/(\d{2})(\d{2})/, "$1:$2"),
            final: os.HRFIM_OS.replace(/(\d{2})(\d{2})/, "$1:$2")
        });

        setDescription(os.OBS)
        setDate(os.DTINI_OS.substring(0,10));

        setModalEditOS(true);
    }

    async function updateOs() {

        if((!hours.initial) || (!hours.final) || (!date)) {
            alert("Selecione uma data e hora inicial/final");
            return;
        }


        if( hours.initial > hours.final) {

            alert("Hora inicial não pode ser maior que a hora final!")
            return;

        }

        if(description.trim() === "") {

            alert("Descrição do chamado é obrigatória!")
            return;
        }




        let result = await fetch("/api/os/update", {
            method: "POST",
            body: JSON.stringify({
                codOs: selectedOs.COD_OS,
                description,
                date,
                startTime:hours.initial,
                endTime: hours.final
            })
        })
            .then((res) => res.json())
            .then((res) => res);

        if (!result) return;

        getCalls();

        setModalEditOS(false);

        return

    }

    return (
        <main className="w-full h-full flex flex-col justify-center items-center p-4">
            {isOpenModal && (
                <Modal
                    isOpen={isOpenModal}
                    setOpenModal={setOpenModal}
                    title="Descrição"
                >
                    <p
                        className="my-4 text-blueGray-500 text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: description }}
                    ></p>
                </Modal>
            )}

            {
                modalTarefa &&
                <Modal 
                    isOpen={modalTarefa}
                    setOpenModal={setModalTarefa}
                    title="Selecione a Tarefa do chamado!"
                    action={updateChamadoTarefa}
                >
                    <select name="tarefa" id="tarefa" onChange={(event) => setSelectedTask( event.target.value)}>
                        <option value="">Selecione uma Tarefa</option>
                        {   
                            tasks.map((task: any, index) => (
                                <option key={index} value={task.COD_TAREFA}>{task.NOME_TAREFA}</option>
                            ))
                        }
                    </select>

                </Modal>
            }

            {modalStandby && (
                <Modal
                    isOpen={modalStandby}
                    setOpenModal={setModalStandby}
                    title="StandBy"
                    action={() => standbyCall(selectedCall)}
                >
                    <label>Descrição</label>
                    <textarea
                        rows={5}
                        className="w-full border-zinc-300 border-2 outline-none rounded-lg resize-none p-2"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />

                    <p>Horas</p>

                    <div className="w-full flex flex-row justify-between gap-8 pt-2">
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => updateInitialHour(event.target.value)}
                            onBlur={event => updateInitialHour(validTime(event.target.value))}
                            value={hours.initial}
                            type="time"
                        />
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => updateFinalHour(event.target.value)}
                            onBlur={event => updateFinalHour(validTime(event.target.value))}
                            value={hours.final}
                            type="time"
                        />
                    </div>

                    <p className="pt-4">Data</p>
                    <div className="w-full flex flex-row justify-between gap-8 pt-2">
                            
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => setDate(event.target.value)}
                            value={date}
                            type="date" />
                    </div>
                </Modal>
            )}

            {
                modalEditOS && <Modal
                    title="Editar apontamento"
                    isOpen={modalEditOS}
                    setOpenModal={setModalEditOS}
                    action={updateOs} 

                >
                    <p>Chamado: {selectedOs?.COD_OS}</p>
                    <label>Descrição</label>
                    <textarea
                        rows={5}
                        className="w-full border-zinc-300 border-2 outline-none rounded-lg resize-none p-2"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />

                    <p>Horas</p>

                    <div className="w-full flex flex-row justify-between gap-8 pt-2">
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => updateInitialHour(event.target.value)}
                            onBlur={event => updateInitialHour(validTime(event.target.value))}
                            value={hours.initial}
                            type="time"
                        />
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => updateFinalHour(event.target.value)}
                            onBlur={event => updateFinalHour(validTime(event.target.value))}
                            value={hours.final}
                            type="time"
                        />
                    </div>

                    <p className="pt-4">Data</p>
                    <div className="w-full flex flex-row justify-between gap-8 pt-2">
                            
                        <input
                            className="border-zync-300 border-2 outline-none rounded-lg p-2 w-[40%]"
                            onChange={(event) => setDate(event.target.value)}
                            value={date}
                            type="date" />
                    </div>
                </Modal>
            }

            <header className="flex flex-row w-full justify-around p-4">
                <p className="text-blue-500">{iconv.decode(session?.user.name??'', 'ISO-8859-1')}</p>
                <p
                    className="bg-zync-500 text-blue-500 rounded-lg cursor-pointer"
                    onClick={() => signOut()}
                >
                    Logout
                </p>
            </header>

            <section className="flex flex-row justify-center w-full margin-auto max-w-[800px]">
                <h2
                    className={
                        tab === "chamado"
                            ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1"
                            : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1"
                    }
                >
                    Chamado
                </h2>
                <h2
                    className={
                        tab === "os"
                            ? "bg-orange-700 w-[50%] text-center text-white h-8 p-1"
                            : "bg-zinc-100 w-[50%] text-center text-zinc-700 h-8 p-1 line-through"
                    }
                >
                    OS (em breve)
                </h2>
            </section>



            <section className="w-full sm:text-sm text-xs pt-6 overflow-auto">

                {/* <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        getRowId={r => r.COD_CHAMADO}
                        rows={calls}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        pageSizeOptions={[5]}

                    />
                </Box> */}


                <table className="w-full min-w-full border-collapse rounded-lg">
                    <thead>
                        <tr className="text-cyan-100 bg-cyan-900 h-12 rounded-tl-lg rounded-tr-lg">
                            <th onClick={_ => orderTo('COD_CHAMADO')} className="rounded-tl-lg cursor-pointer">Número</th>
                            <th className="cursor-pointer" onClick={_ => orderTo('ASSUNTO_CHAMADO')}>Assunto</th>
                            <th className="cursor-pointer" onClick={_ => orderTo('DTENVIO_CHAMADO')}>Data</th>
                            <th className="cursor-pointer" onClick={_ => orderTo('STATUS_CHAMADO')}>Status</th>
                            <th className="w-[130px] rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calls.map((c: any, k: number) => (
                            <tr
                                key={`${k}call`}
                                className={"odd:bg-zinc-100 p-4 border-2" +
                                    (c?.COD_CHAMADO === selectedCall?.COD_CHAMADO
                                        ? " !bg-indigo-200 outline-2"
                                        : "")
                                }
                                onClick={() => changeSelectedCall(c) }
                            >
                                <td className="text-center p-2">
                                    {c?.COD_CHAMADO?.toLocaleString("pt-br")}
                                </td>
                                <td className="text-start  p-2">{c?.ASSUNTO_CHAMADO}</td>
                                <td className="text-center  p-2">
                                    {c?.DTENVIO_CHAMADO?.replace("-", " ")}
                                </td>
                                <td className="text-center  p-2">{c?.STATUS_CHAMADO}</td>
                                <td className="text-center flex flex-row gap-4 sm:gap-2 sm:flex-nowrap flex-wrap  sm:justify-between justify-center  max-w-[130px] p-2">

                                    <LuPointer 
                                        onClick={(e) => {e.stopPropagation()} }
                                        title="APONTAMENTO"
                                        style={{ cursor: "pointer" }}
                                        className="text-indigo-900 hover:text-indigo-500"
                                        size={18}
                                    />

                                    {c.STATUS_CHAMADO !== "EM ATENDIMENTO" && (
                                        <VscDebugStart
                                            onClick={(e) =>  { /* e.stopPropagation(); */startCall(c);}}
                                            title="EM ATENDIMENTO"
                                            style={{ cursor: "pointer" }}
                                            className="text-green-600 hover:text-green-400"
                                            size={18}
                                        />
                                    )}

                                    {c.STATUS_CHAMADO !== "STANDBY" &&
                                        c.STATUS_CHAMADO !== "AGUARDANDO VALIDACAO" &&
                                        c.STATUS_CHAMADO !== "ATRIBUIDO" && (
                                            <PiPauseDuotone
                                                title="STANDBY"
                                                onClick={(e) => { setModalStandby(true) }}
                                                style={{ cursor: "pointer" }}
                                                className="text-yellow-500 hover:text-yellow-300"
                                                size={18}
                                            />
                                        )}

                                    {c.STATUS_CHAMADO !== "AGUARDANDO VALIDACAO" &&
                                        c.STATUS_CHAMADO !== "ATRIBUIDO" && (
                                            <ImStop
                                                onClick={(e) =>  { /* e.stopPropagation(); */changeStatus(c, STATUS_CHAMADO['AGUARDANDO VALIDACAO']);}}
                                                title="AGUARDANDO VALIDAÇÃO"
                                                style={{ cursor: "pointer" }}
                                                className="text-red-700 hover:text-red-500"
                                                size={18}
                                            />
                                        )}

                                    {c.STATUS_CHAMADO !== "ATRIBUIDO" && (
                                        <TbCalendarCheck
                                            onClick={(e) =>  { /* e.stopPropagation(); */changeStatus(c, STATUS_CHAMADO['FINALIZADO']);}}
                                            title="FINALIZADO"
                                            style={{ cursor: "pointer" }}
                                            className="text-orange-500 hover:text-orange-300"
                                            size={18}
                                        />
                                    )}

                                    <HiOutlineClipboardDocumentList
                                        onClick={() => openDescriptions(c)}
                                        title="Detalhamento"
                                        style={{ cursor: "pointer" }}
                                        className="text-fuchsia-700 hover:text-fuchsia-500"
                                        size={18}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="w-full sm:text-sm text-xs pt-6 overflow-auto">
                <input placeholder="Selecione uma data" type="date" value={selectedDate} onChange={changeSelectedDate} className="h-8 p-2 w-[160px] outline-none border-2 border-zinc-200 rounded-md" />
                <IoCloseCircleOutline onClick={_ => setSelectedDate('')} className="cursor-pointer text-red-500 size-4 top-[-1.6px] rounded-lg inline left-[-50px] relative" />
            </section>


            {loadingOs ? (
                <Loading />
            ) : (
                !!listOs?.length && (
                    <section className="w-full sm:text-sm text-xs pt-6 overflow-auto">
                        <table className="w-full min-w-full border-collapse rounded-lg">
                            <thead>
                                <tr className="text-cyan-100 bg-cyan-800 h-10 rounded-tl-lg rounded-tr-lg">
                                    <th className="rounded-tl-lg">Código</th>
                                    <th>Cliente</th>
                                    <th>Tarefa</th>
                                    <th>Data</th>
                                    <th>Hora Início</th>
                                    <th>Hora Fim</th>
                                    <th className="w-[130px]">Tempo</th>
                                    <th className="rounded-tr-lg"></th>
                                </tr>
                            </thead>

                            <tbody className="max-h-[300px] overflow-auto text-xs">
                                {listOs.map((os: any) => (
                                    <tr
                                        key={os?.COD_OS}
                                        className="odd:bg-zinc-100 h-[20px] border-zinc-300 border-b-2"
                                    >
                                        <td className="p-2 text-center">
                                            {os?.COD_OS.toLocaleString("pt-br")}
                                        </td>
                                        <td className="p-2 text-center">{os.NOME_CLIENTE}</td>
                                        <td className="p-2">{os.OBS}</td>
                                        <td className="p-2 text-center">
                                            {new Date(os.DTINI_OS).toLocaleString("pt-br", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </td>
                                        <td className="p-2 text-center">
                                            {os.HRINI_OS.replace(/(\d{2})(\d{2})/g, "$1:$2")}
                                        </td>
                                        <td className="p-2 text-center">
                                            {os.HRFIM_OS.replace(/(\d{2})(\d{2})/g, "$1:$2")}
                                        </td>
                                        <td className="p-2 text-center">
                                            {getTimeOs(os.HRINI_OS, os.HRFIM_OS)}
                                        </td>
                                        <td>
                                        <CiEdit 
                                            onClick={() => handleEdit(os)}
                                            style={{ cursor: "pointer" }} 
                                            className="text-red-700 hover:text-red-500 text-center"
                                            size={18}/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-yellow-200 text-xs">
                                    <td colSpan={4} className="p-2 text-center"></td>
                                    <td colSpan={4} className="p-2 text-right text-orange-800">
                                        total: <b>{totalTimesOs()} hrs</b>
                                    </td>
                                    
                                </tr>
                            </tfoot>
                        </table>
                    </section>
                )
            )}
        </main>
    );
}
