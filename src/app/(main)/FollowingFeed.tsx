"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import LoadingSkeleton from "@/components/posts/editor/LoadingSkeleton";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

const FollowingFeed = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return (
      <div>
        <LoadingSkeleton />
      </div>
    );
  }
  if (status === "success" && !hasNextPage && !posts.length) {
    return (
      <p className="text-muted-foreground text-center">
        No posts found. Start Following people to see there posts here
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="text-destructive text-center">
        <p>Error Loading posts</p>
      </div>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
};

export default FollowingFeed;
