'use client'

import {  useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const createLoginFormSchema = z.object({
    login: z
        .string({
            required_error: "Campo Obrigatório."
        })
        .min(3, "Campo Obrigatório."),
    password: z.string({
            required_error: "Campo Obrigatório."
        })
        .min(1, "Campo Obrigatório.")
})

type createLoginFormData = z.infer<typeof createLoginFormSchema>

export default function Login() {

    const { register, handleSubmit, formState: { errors } } = useForm<createLoginFormData>({
        resolver: zodResolver(createLoginFormSchema)
      })
    
    function login(data:any) {
        /* signIn(`Credentials`, data) */
    }


    return (
        <form onSubmit={handleSubmit(login)}>
        <main className="flex flex-col content-center items-center p-24 gap-4">

            <h2 className="text-center">GerProj</h2>
            <div className="flex flex-col content-start w-64">
                <label className="text-start">Login</label>
                <input  
                    {...register("login")} 
                    name="login" 
                    className="outline-none border border-gray-300 w-full h-12 rounded-lg p-4" />
            </div>
            <div className="flex flex-col content-start w-64">
                <label className="text-start">Senha</label>
                <input 
                    {...register("password")} 
                    type="password" 
                    name="password" 
                    className="outline-none border border-gray-300 w-full h-12 rounded-lg p-4" />
            </div>

            <div className="flex flex-col content-start w-64">
                <button className="border-none bg-green-800 w-full h-12 rounded-lg text-white hover:bg-green-900">Login</button>
            </div>
        </main>
        </form>
    )
}