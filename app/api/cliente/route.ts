import SuportCallService from '@/services/call/suport-call';
import OsService from '@/services/os/list';
import ListTaskService from '@/services/tarefa/list';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handlerPost(request: NextRequest) {
  
  const  {
    chamado,
    data,
    recurso,
  } = await request.json()

  const response = await OsService.list(chamado, recurso, data)
  return NextResponse.json(response)
}

async function handlerGet(request: NextRequest) {

  const { searchParams } = new URL(request.url)
  const recurso = searchParams.get('recurso')  
  const response = await ListTaskService(`${recurso}`)
  return NextResponse.json(response)
}

export { handlerPost as POST,  handlerGet as GET};