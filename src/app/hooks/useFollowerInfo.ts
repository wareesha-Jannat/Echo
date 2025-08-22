import kyInstance from "@/lib/ky";
import { FollowingData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowingData,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowingData>(),
    initialData: initialState,
    staleTime: Infinity,
  });
  return query;
}
