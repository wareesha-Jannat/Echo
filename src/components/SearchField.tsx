"use client"

import { useRouter } from "next/navigation"
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchField(){
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (form.q as HTMLInputElement).value.trim();
        if(!q) return
        router.push(`/search?q=${encodeURIComponent(q)}`)

    }

    return <form onSubmit={handleSubmit} method="GET" action={'/search'} className="order-3 max-[450px]:w-full ">
        <div className="relative">
          <Input placeholder="Search" name="q" className="pe-10 w-full !bg-transparent border" />
          <SearchIcon className="size-5 absolute right-5 top-1/2 -translate-y-1/2 transform text-muted-foreground " />
        </div>
        
    </form>
}