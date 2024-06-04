'use server'

import { Firebird, options } from "./firebird";

function xorString(inputString: string) {
    let result = '';
    const key = 23;

    for (let i = 0; i < inputString.length; i++) {
        result += String.fromCharCode(key ^ inputString.charCodeAt(i));
    }

    return result;
}

export default async function UserService({ login, password } :{ login: string, password: string}){ 
    
        return new Promise((resolve, reject ) => {

            Firebird.attach(options, function(err: any, db: any) {

                if (err) {
                    return reject(err.message())
                }
            
                // db = DATABASE
                db.query(
                `SELECT 
                    U.COD_USUARIO,
                    U.SENHA, 
                    U.NOME_USUARIO, 
                    R.COD_RECURSO 
                        FROM 
                    USUARIO U 
                        JOIN 
                    RECURSO R ON (U.COD_USUARIO = R.CODUSR_RECURSO) 
                        WHERE 
                    ID_USUARIO = ?`, 
                [login.toUpperCase()], async function(err: any, result: any) {
    
                    db.detach();
    
                    if (err) {
                        return reject(err.message())
                    } 
    
                    
                    if(! result.length ) {
                        return reject("Usuário não encontrado");
                    }
    
                    if(result[0]?.SENHA?.trim() != xorString(password?.trim())) {
                        return reject("Senha incorreta");
                    }
                    
                    return resolve(result[0])
                    // IMPORTANT: close the connection
                    
                });
            
            });
        })

        
   
   }



export { UserService }