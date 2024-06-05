import UserService from "@/services/usuario"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
    callbacks: {
      session({ session, token, user }) {
        session.user.recurso = session.user.email['COD_RECURSO']
        session.user.id = session.user.email['COD_USUARIO']
        session.user.email = ""
        return session 
      },
    },
    providers: [
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            username: { label: "Username", type: "text", placeholder: "solutii.s" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials, req) {

            try {
              const user: any = await UserService({
                login: credentials?.username??'',
                password: credentials?.password??''
              })
  
              return {
                
                id: user['COD_USUARIO'],
                name: user['NOME_USUARIO'],
                email: user

              }

            } catch(error) {
              console.log(error)
              return null
            }
      
          },
          
        })
      ],
      /* pages: {
        signIn: '/login'
      } */
})

export { handler as GET, handler as POST }