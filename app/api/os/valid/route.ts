import SuportCallService from '@/services/call/suport-call';
import OsService from '@/services/os/list';
import ValidLimitDate from '@/services/os/valid';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  
  const  {
    recurso
  } = await request.json()

  
  const response = await ValidLimitDate(recurso)

  return NextResponse.json(response)
}

export { handler as POST };