"use server";

import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GetCommentDataInclude, PostData } from "@/lib/types";
import { addCommentSchema } from "@/lib/validation";

export async function SubmitComment({
  post,
  commentMessage,
}: {
  post: PostData;
  commentMessage: string;
}) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("unauthorized");
  const { content } = addCommentSchema.parse({ content: commentMessage });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content,
        userId: loggedInUser.id,
        postId: post.id,
      },
      include: GetCommentDataInclude(loggedInUser.id),
    }),
    ...(loggedInUser.id !== post.userId
      ? [
          prisma.notification.create({
            data: {
              issuerId: loggedInUser.id,
              recipientId: post.userId,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}
export async function deleteComment(id: string) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: GetCommentDataInclude(loggedInUser.id),
  });
  return deletedComment;
}
