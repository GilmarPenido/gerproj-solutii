import ApointService from '@/services/os/apoint';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    os,
    date,
    description,
    endTime,
    startTime,
    state,
    task,
    recurso
  } = await request.json();


  try {
    const response = await ApointService(os, description, date, startTime, endTime, recurso, task)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };