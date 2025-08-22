import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteComment, SubmitComment } from "./actions";
import { CommentPage } from "@/lib/types";
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
      ),
        toast({
          description: "Comment added successfully",
        });
    },
    onError: (error) => {
      console.log(error),
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
      ),
        toast({
          description: "comment deleted successfully",
        });
    },
    onError(error) {
      toast({
        variant: "destructive",
        description: "Failed to delete Comment",
      });
    },
  });
  return mutation;
}
