export type TaskType = {
    COD_TAREFA: string
    NOME_TAREFA: string
    CODPRO_TAREFA: string
    DTSOL_TAREFA: string
    DTAPROV_TAREFA: string
    DTPREVENT_TAREFA: string
    HREST_TAREFA: string
    STATUS_TAREFA: number
    OBS_TAREFA: string
}





export enum STATUS_TASK {
    'EM ATENDIMENTO' = '2',
    'ATRIBUIDO' = '1',
    'STANDBY' = '3',
    'AGUARDANDO VALIDACAO' = '4',
    'FINALIZADO' = '5',
}