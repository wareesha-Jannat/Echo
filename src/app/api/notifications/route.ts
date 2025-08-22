import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notificationInclude, NotificationPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
           const {user: loggedInUser} = await validateRequest();
    if(!loggedInUser){
        return NextResponse.json({
        error : "Unauthorized"
        }, {status: 401})
    }

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined
    const pageSize = 7

    const notifications  = await prisma.notification.findMany({
        where : {
            recipientId : loggedInUser.id
        },
        include : notificationInclude,
        orderBy : {
            createdAt : 'desc'
        },
        take : pageSize + 1,
        cursor : cursor ? {id : cursor} : undefined
    })
    const nextCursor = notifications.length > pageSize ? notifications[pageSize].id : null
    const finalNotifications = notifications.slice(0, pageSize)

    const data  : NotificationPage ={
         notifications : finalNotifications,
         nextCursor,
    }
    return NextResponse.json(data)
    } catch (error) {
        console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
    
 
}