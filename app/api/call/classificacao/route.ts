import StandbyCallService from '@/services/call/standby'
import ClassificacaoService from '@/services/call/classificacao';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {

  const {
    chamado,
  } = await request.json();

  try {
    const response = await ClassificacaoService()

    return NextResponse.json(response)
  } catch(error) {

    return NextResponse.json(error)
  }
  
}

export { handler as POST };