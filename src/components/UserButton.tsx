"use client"

import { useSession } from "../app/(main)/SessionProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Check, LogOutIcon, Monitor, MoonIcon, Sun, UserIcon } from "lucide-react";
import { logout } from "@/app/(auth)/logout/actions";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

interface UserButtonProps {
    className? : string;
}

export default function UserButton({className}:UserButtonProps){
    const {user} = useSession();
    const {theme, setTheme} = useTheme();
    const QueryClient = useQueryClient();

    return(
        <DropdownMenu >
            <DropdownMenuTrigger asChild >
                <button className={cn("flex-none rounded-full", className)}>
                    <UserAvatar avatarUrl={user.avatarUrl} size={40} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent >
                <DropdownMenuLabel>
                    Logged in as @{user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
               <Link href={`/users/${user.username}`}>
                <DropdownMenuItem >
                    <UserIcon className="size-5 mr-2" />
                    Profile
                </DropdownMenuItem>
               </Link>
               <DropdownMenuSeparator />
               <DropdownMenuSub>
                 <DropdownMenuSubTrigger>
                 <Monitor className="size-5 mr-2" />
                
                 Theme
               </DropdownMenuSubTrigger>
               <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={()=> setTheme("system")}>
                         <Monitor className="size-5 mr-2" />
                         System
                         {theme === "system" && <Check className="size-4 mx-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=> setTheme("light")}>
                         <Sun className="size-5 mr-2" />
                         Light
                         {theme === "light" && <Check className="size-4 mx-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=> setTheme("dark")}>
                         <MoonIcon className="size-5 mr-2" />
                         Dark
                         {theme === "dark" && <Check className="size-4 mx-auto" />}
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
               </DropdownMenuPortal>
               </DropdownMenuSub>
              
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={()=>{
               QueryClient.clear();
                logout()}} >
                <LogOutIcon className="size-5 mr-2" />
                    Logout
               </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}