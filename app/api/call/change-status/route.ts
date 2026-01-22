import ChangeStatusService from '@/services/call/change-status'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const codChamado = searchParams.get('codChamado')
  const status = searchParams.get('status')
  const data   = searchParams.get('data')

  try {
    const response = await ChangeStatusService(codChamado??'', status??'', '', data??'')

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };