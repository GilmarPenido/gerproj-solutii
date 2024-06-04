import SuportCallService from '@/services/suport-call';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const recurso = searchParams.get('recurso')
  const response = await SuportCallService(recurso??'')

  return NextResponse.json(response)
}

export { handler as GET, handler as POST };