import { CommentPage, PostData } from "@/lib/types";
import React from "react";
import AddComment from "./AddComment";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import LoadingSkeleton from "../posts/editor/LoadingSkeleton";
import InfiniteScrollContainer from "../InfiniteScrollContainer";
import Comment from "./Comment";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  post: PostData;
}
const Comments = ({ post }: CommentsProps) => {
  const postId = post.id;

  const {
    data,
    status,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(`/api/posts/${postId}/comments`, {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<CommentPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const comments = data?.pages.flatMap((page) => page.comments) || [];

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto size-7 animate-spin space-y-5" />
      </div>
    );
  }
  if (status === "success" && !hasNextPage && !comments.length) {
    return (
      <>
        <div className="space-y-3">
          <AddComment post={post} />
          <p className="text-muted-foreground text-center">
            No one has commented anything yet.
          </p>
        </div>
      </>
    );
  }
  if (status === "error") {
    return (
      <div className="text-destructive text-center">
        <p>Error Loading comments</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <AddComment post={post} />

      <InfiniteScrollContainer
        className="space-y-5"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {comments?.map((c) => (
          <Comment key={c.id} comment={c} />
        ))}
      </InfiniteScrollContainer>
    </div>
  );
};

export default Comments;
