import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getpostDataInclude, PostsPage } from "@/lib/types";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 4;

    const posts = await prisma.post.findMany({
      where: {
        bookmarks: {
          some: {
            userId: loggedInUser.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: getpostDataInclude(loggedInUser.id),
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const bookmarkedPosts = posts.slice(0, pageSize);

    const data: PostsPage = {
      posts: bookmarkedPosts,
      nextCursor,
    };
    return NextResponse.json(data);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
