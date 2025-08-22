import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from './Navbar'

import MenuBar from "./MenuBar";
import SessionWrapper from "./SessionWrapper";


export default async function Layout({children} : {children: React.ReactNode}){
    const session = await validateRequest();
    if(!session.user) redirect('/login')

        return ( 
        <SessionWrapper value={session} >
            <div className="min-h-screen flex flex-col  ">
                <Navbar />
                
                <div className="max-w-7xl mx-auto p-5 flex w-full grow gap-5">
                    <MenuBar className="sticky top-21 h-fit py-3 bg-card hidden sm:block flex-none  spaace-y-3 rounded-2xl shadow-sm xl:w-80"/>
                    {children}
                    </div> 
                <MenuBar className="sticky bottom-0 items-center justify-center  border-t sm:hidden flex w-[90vw] mx-auto space-x-2 rounded-2xl shadow-sm bg-card  p-2"/>
            </div>
           </SessionWrapper>)


}