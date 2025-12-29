import AtualizarAcessoCliente from '@/services/tarefa/acesso';
import { NextResponse, type NextRequest } from 'next/server'
 
async function handler(request: NextRequest) {
  
  const {
    descricao,
    cliente
  } = await request.json();
  

  try {
    const response = await AtualizarAcessoCliente( 
      descricao,
      cliente)

    return NextResponse.json(response)
  } catch(error) {


    return NextResponse.json(error)
  }
  
  

  
}

export { handler as POST };