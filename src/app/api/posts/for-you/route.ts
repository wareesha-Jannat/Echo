import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getpostDataInclude, PostsPageWithMoods } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 3;
    if (!user) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: getpostDataInclude(user.id),
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const moods: string[] = (
      await prisma.post.findMany({
        where: { mood: { not: null } },
        select: {
          mood: true,
        },
        distinct: ["mood"],
      })
    ).map((m) => m.mood as string);
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const finalPosts = posts.slice(0, pageSize);

    const data: PostsPageWithMoods = {
      posts: finalPosts,
      moods,
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
