import {
  useMutation,
  useQueryClient,
  QueryFilters,
  InfiniteData,
} from "@tanstack/react-query";
import { EditProfile } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { UpdateProfileValues } from "@/lib/validation";
import { PostsPage, PostsPageWithMoods } from "@/lib/types";
import { UpdateAvatarOnStream } from "./profile/update";
import kyInstance from "@/lib/ky";
import { useSession } from "../../SessionProvider";

export function useUpdateProfileMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([EditProfile(values), avatar && UpdateAvatar(avatar)]);
    },
    onSuccess: async ([updatedProfile, newAvatarUrl]) => {
      const updatedUser = updatedProfile;
      const userAvatarUrl = newAvatarUrl || updatedUser.avatarUrl;

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

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id == updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: userAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<PostsPageWithMoods, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              moods: page.moods,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: userAvatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );
      router.refresh();
      toast({
        description: "Profile Updated",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. please try again",
      });
    },
  });
  return mutation;
}

export async function UpdateAvatar(avatar: File) {
  const formData = new FormData();
  formData.append("file", avatar);

  const response = await kyInstance
    .post("/api/users/avatar", {
      body: formData,
    })
    .json<{ avatarUrl: string }>();

  const data = await UpdateAvatarOnStream(response.avatarUrl);
  if (data.success) {
    return response.avatarUrl;
  } else {
    return null;
  }
}
