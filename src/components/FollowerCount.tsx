"use client";
import useFollowerInfo from "@/app/hooks/useFollowerInfo";
import { FollowingData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialState: FollowingData;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold"> {formatNumber(data.followers)}</span>
    </span>
  );
}
