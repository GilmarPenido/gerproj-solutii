import SuportCallService from '@/services/call/suport-call';
import OsService from '@/services/os/list';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chamado = searchParams.get('chamado')
  const response = await OsService.insert(chamado as string)

  return NextResponse.json(response)
}

export { handler as GET, handler as POST };