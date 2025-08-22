import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { SubmitPost } from "./actions";
import { PostsPage, PostsPageWithMoods } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: SubmitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("user-posts") &&
            query.queryKey.includes(user.id)
          );
        },
      } satisfies QueryFilters;
      const queryKey = ["post-feed", "for-you"];

      queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<PostsPageWithMoods, string | null>>(
        queryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                  moods:
                    newPost.mood !== null
                      ? [...firstPage.moods, newPost.mood]
                      : [...firstPage.moods],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      queryClient.invalidateQueries({
        //if user tries to post something before existing posts load
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return (
            queryFilter.predicate(query) &&
            query.queryKey.includes("for-you") &&
            !!query.state.data
          );
        },
      });
      toast({
        description: "Post created successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to post . Please try again",
      });
    },
  });
  return mutation;
}
