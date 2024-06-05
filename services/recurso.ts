'use server'

import { Firebird, options } from "./firebird";


export default async function RecursoService({ login, password } :{ login: string, password: string}){ 
    
        return new Promise((resolve, reject ) => {

            Firebird.attach(options, function(err: any, db: any) {

                if (err) {
                    return reject(err.message())
                }
            
                // db = DATABASE
                db.query('SELECT * FROM USUARIO WHERE ID_USUARIO = ?', [login.toUpperCase()], async function(err: any, result: any) {
    
                    db.detach();
    
                    if (err) {
                        return reject(err.message())
                    } 
    
                    
                    if(! result.length ) {
                        return reject("Usuário não encontrado");
                    }
    
                    
                    return resolve(result[0])
                    // IMPORTANT: close the connection
                    
                });
            
            });
        })

        
   
   }