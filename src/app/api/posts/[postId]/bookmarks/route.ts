import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

export async function GET (req:Request, {params} : {params  : Promise<{postId : string}>} ){
    try {
        const {postId} = await params
         const {user : loggedInUser} = await validateRequest();
        if(!loggedInUser) {
            return Response.json({error : "Unauthorized"}, {status: 401})
        }

        const post  = await prisma.post.findUnique({
            where : {id: postId},
            select : {
                bookmarks : {
                    where: {
                         userId : loggedInUser.id
                    }
                    
                }
            }
        })

        if(!post){
            return Response.json({error: "post not found"},{status: 404})
        }
        const data : BookmarkInfo = {
              isBookmarkedByUser : !!post.bookmarks.length
        }
    } catch (error) {
        console.log(error)
        return Response.json({
            error: "Internal Server error. try again later"
        })
    }
}

export async function POST(req:Request, {params}: {params: Promise<{postId : string}>}){
    try {
        const {postId} = await params
        const {user : loggedInUser} = await validateRequest();
        if(!loggedInUser) {
            return Response.json({error : "Unauthorized"}, {status: 401})
        }
        await prisma.bookmark.upsert({
            where : {
                userId_postId:{
                    userId : loggedInUser.id,
                    postId,
                }
            }, create : {
                 userId : loggedInUser.id,
                    postId,
            }, update: {}
        })

        return new Response()
    } catch (error) {
         console.log(error)
        return Response.json({
            error: "Internal Server error. try again later"
        })
    }
    }
    export async function DELETE(req:Request, {params}: {params: Promise<{postId : string}>}){
    try {
        const {postId} = await params
        const {user : loggedInUser} = await validateRequest();
        if(!loggedInUser) {
            return Response.json({error : "Unauthorized"}, {status: 401})
        }
        await prisma.bookmark.deleteMany({
            where : {
               
                    userId : loggedInUser.id,
                    postId,
               
            }
        })

        return new Response()
    } catch (error) {
         console.log(error)
        return Response.json({
            error: "Internal Server error. try again later"
        })
    }
    }
