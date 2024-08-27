import UpdateCallService from '@/services/call/standby';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  
  const {
    codChamado,
    data,
    horaIni,
    horaFim,
    state
  } = await request.json();
  

  try {
    const response = await UpdateCallService( 
      codChamado,
      data,
      horaIni,
      horaFim,
      state)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as POST };