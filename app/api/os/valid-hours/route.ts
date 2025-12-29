import ValidHoursService from '@/services/tarefa/valid-hours'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    chamado,
    date,
    endTime,
    startTime,
  } = await request.json();


  try {
    const response = await ValidHoursService(chamado, date, startTime, endTime)
    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };