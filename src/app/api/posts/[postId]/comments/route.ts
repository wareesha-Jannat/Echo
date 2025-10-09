import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentPage, GetCommentDataInclude } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 4;

    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: GetCommentDataInclude(loggedInUser.id),
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = comments.length > pageSize ? comments[pageSize].id : null;

    const finalComments = comments.slice(0, pageSize);
    const data: CommentPage = {
      comments: finalComments,
      nextCursor,
    };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server Error",
      },
      { status: 500 },
    );
  }
}
