import TaskDetailsService from '@/services/call/task-details';
import UpdateCallTaskService from '@/services/call/update';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    COD_CHAMADO

  } = await request.json();

  try {
    const response = await TaskDetailsService(COD_CHAMADO)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as POST };