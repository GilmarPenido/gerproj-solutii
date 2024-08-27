import StartCallService from '@/services/call/start'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const codChamado = searchParams.get('codChamado')
  

  try {
    const response = await StartCallService(codChamado??'')

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };