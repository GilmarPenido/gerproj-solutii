import UpdateCallClassService from '@/services/call/updateClassificacao';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    COD_CHAMADO, COD_CLASSIFICACAO

  } = await request.json();

  try {
    const response = await UpdateCallClassService(COD_CHAMADO, COD_CLASSIFICACAO)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as POST };