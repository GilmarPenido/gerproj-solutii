import DeleteOsService from '@/services/os/delete';
import UpdateOsService from '@/services/os/update'
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {


  const {
    codOs
  } = await request.json();


  try {
    const response = await DeleteOsService(codOs)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as GET, handler as POST };