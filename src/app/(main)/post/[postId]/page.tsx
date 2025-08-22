import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getpostDataInclude } from "@/lib/types";
import { cache } from "react";
import Post from "@/components/posts/Post";
import { Metadata } from "next";

import PostUserInfo from "./PostUserInfo";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getpostDataInclude(loggedInUserId),
  });

  if (!post) notFound();
  return post;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  const post = await getPost(postId, loggedInUser.id);
  return {
    title: `${post?.user.displayName}: ${post?.content.slice(0, 50)}...`,
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const { user } = await validateRequest();
  if (!user) {
    return (
      <>
        <p className="text-destructive">
          {" "}
          you are not not authorized to see this page{" "}
        </p>{" "}
      </>
    );
  }

  const post = await getPost(postId, user.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-3">
        <Post post={post} />
      </div>
      <PostUserInfo user={post.user} loggedInUserId={user.id} />
    </main>
  );
}
