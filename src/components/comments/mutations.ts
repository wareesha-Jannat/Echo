import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteComment, SubmitComment } from "./actions";
import { CommentPage, PostsPage, PostsPageWithMoods } from "@/lib/types";
import { toast } from "../ui/use-toast";

export function useSubmitCommentMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: SubmitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", newComment.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          const firstPage = oldData.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  nextCursor: firstPage.nextCursor,
                  comments: [newComment, ...firstPage.comments],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      updateCommentCount(newComment.postId, 1, queryClient);
      toast({
        variant: "success",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to comment. please try again later",
      });
    },
  });
  return mutation;
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              comments: page.comments.filter((c) => c.id !== deletedComment.id),
            })),
          };
        },
      );

      updateCommentCount(deletedComment.postId, -1, queryClient);
      toast({
        variant: "success",
        description: "comment deleted successfully",
      });
    },
    onError() {
      toast({
        variant: "destructive",
        description: "Failed to delete Comment",
      });
    },
  });
  return mutation;
}

function updateCommentCount(
  postId: string,
  delta: number,
  queryClient: QueryClient,
) {
  const queryKey1: QueryKey = ["post-feed", "for-you"];
  const queryKey2: QueryKey = ["post-feed", "following"];

  queryClient.setQueryData<InfiniteData<PostsPageWithMoods, string | null>>(
    queryKey1,
    (oldData) => {
      if (!oldData) return;
      return {
        pageParams: oldData.pageParams,
        pages: oldData.pages.map((page) => ({
          nextCursor: page.nextCursor,
          moods: page.moods,
          posts: page.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _count: {
                    ...post._count,
                    commmets: post._count.commmets + delta,
                  },
                }
              : post,
          ),
        })),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<PostsPage, string | null>>(
    queryKey2,
    (oldData) => {
      if (!oldData) return;
      return {
        pageParams: oldData.pageParams,
        pages: oldData.pages.map((page) => ({
          nextCursor: page.nextCursor,
          posts: page.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _count: {
                    ...post._count,
                    commmets: post._count.commmets + delta,
                  },
                }
              : post,
          ),
        })),
      };
    },
  );

  console.log("count updated successfully");
}
