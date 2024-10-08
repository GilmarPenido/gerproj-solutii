import SuportCallService from '@/services/call/suport-call';
import OsService from '@/services/os/list';
import ListTaskService from '@/services/tarefa/list';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handlerPost(request: NextRequest) {
  
  const  {
    tarefa,
    data,
    recurso,
  } = await request.json()

  const response = await OsService.listOsTarefa(tarefa, recurso, data)
  return NextResponse.json(response)
}



export { handlerPost as POST };