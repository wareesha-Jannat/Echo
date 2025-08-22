"use server"

import {   deleteSession, deleteSessionCookie,  validateRequest } from "@/auth"
import { redirect } from "next/navigation";


export async function logout(){
    const {session} = await validateRequest();   //checks is user authenticated
    if(!session){
        throw new Error('Unauthorized')
    }

    await deleteSession(session.id)
    await deleteSessionCookie()

    return redirect('/login')
}