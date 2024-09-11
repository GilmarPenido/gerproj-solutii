import UpdateCallTaskService from '@/services/call/update';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    COD_CHAMADO, COD_TAREFA

  } = await request.json();

  try {
    const response = await UpdateCallTaskService(COD_CHAMADO, COD_TAREFA)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as POST };