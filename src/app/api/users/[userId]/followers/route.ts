import { validateRequest } from "@/auth"
import { prisma } from "@/lib/prisma";
import { FollowingData } from "@/lib/types";

export async function GET(req: Request, {params} : {params : Promise<{userId :string}>}){
    try {

    const {userId}  = await  params
        const {user: loggedInUser} = await validateRequest();
        if(!loggedInUser){
            return Response.json({error: "Unauthorized"},{status: 401})
        }
         console.log("get follower is being called")  // Technically, This endpoint is never called because of staleTime infinity and initial state
        const user = await prisma.user.findUnique({
            where :{
                id : userId
            },
            select :{
            
                _count : {
                    select: {
                        followers: true
                    }
                }
            }
        })

        if(!user) {
            return Response.json({
                error: "user not found"
            }, {status: 404})
        }
      const isFollowing = await prisma.follow.findUnique({
            where :{
                followerId_followingId :{
                    followerId : loggedInUser.id,
                    followingId: userId,
                },
            }})
        const data : FollowingData ={
            followers : user._count.followers,
            isFollowedByUser : !!isFollowing,
        }
        
        return Response.json(data)
    } catch (error) {
        console.log(error)
        return Response.json({error: "Internal server Error"}, {status: 500})
    }
}

export async function POST(req: Request, {params} : {params :Promise<{userId :string}>}){
    try {
         const {userId}  = await  params
         const {user: loggedInUser} = await validateRequest();
        if(!loggedInUser){
            return Response.json({error: "Unauthorized"},{status: 401})
        }

        await prisma.$transaction([
           prisma.follow.upsert({
            where :{
                followerId_followingId :{
                    followerId : loggedInUser.id,
                    followingId: userId,
                },
            },
                create : {
                     followerId : loggedInUser.id,
                    followingId: userId,
                },
                update :{}
            
        }),
        prisma.notification.create({
            data :{
                issuerId: loggedInUser.id,
                recipientId: userId,
                type: "FOLLOW"
            }
        })
        ])

    

        return new Response();
    } catch (error) {
         console.log(error)
        return Response.json({error: "Internal server Error"}, {status: 500})
    }
}
export async function DELETE(req: Request, {params} : {params :Promise<{userId :string}>}){
    try {
         const {userId}  = await  params
         const {user: loggedInUser} = await validateRequest();
        if(!loggedInUser){
            return Response.json({error: "Unauthorized"},{status: 401})
        }
   await prisma.$transaction([
  prisma.follow.deleteMany({
            where : {
                 followerId : loggedInUser.id,
                 followingId: userId,
            }
        }),
        prisma.notification.deleteMany({
            where : {
                issuerId : userId,
                recipientId : loggedInUser.id,
                type: "FOLLOW"
            }
        })
   ])
        
        return new Response();
    } catch (error) {
         console.log(error)
        return Response.json({error: "Internal server Error"}, {status: 500})
    }
}