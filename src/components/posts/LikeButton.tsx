import kyInstance from "@/lib/ky";
import { LikeData } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialState: LikeData;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey = ["like-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () => kyInstance.get(`/api/posts/${postId}`).json<LikeData>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<LikeData>(queryKey);
      queryClient.setQueryData<LikeData>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) +
          (previousState?.isLikedByUser ? -1 : +1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData<LikeData>(queryKey, context?.previousState);
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong please try again",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes}
        <span className="hidden sm:inline"> Likes</span>
      </span>
    </button>
  );
}
