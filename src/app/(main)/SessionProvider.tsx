"use client"

import { SessionAuth, UserAuth } from "@/lib/types";
import {createContext, useContext} from 'react'

interface SessionContext {
 user: UserAuth;
 session :SessionAuth;
}
const SessionContext = createContext<SessionContext | null>(null)

export default function SessionProvider({children, value} : React.PropsWithChildren<{value: SessionContext}>){
    return(
    <SessionContext.Provider value ={value}>
        {children}
    </SessionContext.Provider>
    )
}

export  function useSession(){
    const context = useContext(SessionContext);
    if(!context){ 
        throw new Error("useSession must be used within a SessionProvider")}
    return context
}
