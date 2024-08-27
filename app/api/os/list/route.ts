import SuportCallService from '@/services/call/suport-call';
import OsService from '@/services/os/list';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  
  const  {
    chamado,
    data,
    recurso
  } = await request.json()


  console.log(chamado,
    data,
    recurso)


  
  const response = await OsService.list(chamado, recurso, data)

  return NextResponse.json(response)
}

export { handler as POST };