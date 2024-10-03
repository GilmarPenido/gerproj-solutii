import ValidHoursService from '@/services/call/valid-hours'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    chamado,
    date,
    description,
    endTime,
    startTime,
    state,
    task
  } = await request.json();


  try {
    const response = await ValidHoursService(chamado, description, date, startTime, endTime, state, task)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };