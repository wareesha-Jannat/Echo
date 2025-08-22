"use server"

import { validateRequest } from "@/auth"
import { prisma } from "@/lib/prisma";
import { getpostDataInclude } from "@/lib/types";

export async function deletePost(id: string){
    const {user} = await validateRequest();
    if(!user) throw new Error("unauthorized");
    const post = await prisma.post.findUnique({
        where: {id }
    })
    
    if(!post) throw new Error("Post not found")

        const deletedPost = await prisma.post.delete({
            where:{id},
            include: getpostDataInclude(user.id)
        })

        return deletedPost
}