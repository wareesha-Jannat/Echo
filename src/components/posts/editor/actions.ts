"use server";

import { validateRequest } from "@/auth";
import { postSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getpostDataInclude } from "@/lib/types";

export async function SubmitPost(input: {
  content: string;
  mood: string;
  qod: string | undefined;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("unauthorized");
  }
  const { content, mediaIds, mood, qod } = postSchema.parse(input);
  let dbmood = mood || null;
  let dbQod = qod || null;

  const newPost = await prisma.post.create({
    data: {
      content,
      mood: dbmood,
      qod: dbQod,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },

    include: getpostDataInclude(user.id),
  });
  return newPost;
}
