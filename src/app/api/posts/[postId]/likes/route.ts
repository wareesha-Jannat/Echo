import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LikeData } from "@/lib/types";

export async function GET(
  req: Request,
   {params} : { params: Promise<{ postId: string }> },
) {
  try {
      const {postId} = await params
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    console.log("get likes is being called,"); // Technically, This endpoint is never called because of staleTime infinity and initial state
    if (!post) {
      return Response.json(
        {
          error: "Post not found",
        },
        { status: 404 },
      );
    }

    const data: LikeData = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params}: { params: Promise<{ postId: string }> },
) {
  try {
    const {postId} = await params
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
   const post = await prisma.post.findUnique({
    where : {
        id : postId
    }, select:{
        userId :  true
    }
   })

   if(!post){
     return Response.json({ error: "Post not found" }, { status: 404 });
   }

   await prisma.$transaction([
      prisma.like.upsert({
      where: {
        userId_postId: {
          postId: postId,
          userId: loggedInUser.id,
        },
      },
      create: {
        postId: postId,
        userId: loggedInUser.id,
      },
      update: {},
    }),
  ...(loggedInUser.id !== post.userId ? [
          prisma.notification.create({
         data:{
            recipientId : loggedInUser.id,
            issuerId : post.userId,
            postId,
            type : "LIKE"
        }
    })
  ] : [])
   ])
  
    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params}: { params: Promise<{ postId: string }> },
) {
  try {
    const {postId} = await params
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const post = await prisma.post.findUnique({
    where : {
        id : postId
    }, select:{
        userId :  true
    }
   })

   if(!post){
     return Response.json({ error: "Post not found" }, { status: 404 });
   }

   await prisma.$transaction([
prisma.like.deleteMany({
      where: {
        postId: postId,
        userId: loggedInUser.id,

      },
    }),
    prisma.notification.deleteMany({
        where:{
            recipientId : post.userId,
            issuerId : loggedInUser.id,
            postId,
            type : "LIKE"
        }
    })
   ])
  

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server Error" }, { status: 500 });
  }
}
