import StandbyCallService from '@/services/call/standby'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const codChamado = searchParams.get('codChamado')
  

  try {
    const response = await StandbyCallService(codChamado??'', '', '', '', '', '', '')

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };