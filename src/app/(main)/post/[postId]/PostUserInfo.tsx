"use client";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import TooltipWrapper from "@/components/TooltipWrapper";
import UserAvatar from "@/components/UserAvatar";
import { UserData } from "@/lib/types";
import Link from "next/link";

interface PostUserInfoProps {
  user: UserData;
  loggedInUserId: string;
}

export default function PostUserInfo({
  user,
  loggedInUserId,
}: PostUserInfoProps) {
  if (!user) return null;

  return (
    <div className="bg-card sticky hidden h-fit w-80 space-y-5 rounded-2xl to-[5.25rem] p-5 shadow-sm md:block lg:w-85">
      <div className="text-xl font-bold">About this User</div>
      {user && (
        <TooltipWrapper user={user}>
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl  || user.displayName?.[0]} className="flex-none" />
              <div>
                <p className="line-clamp-1 font-semibold break-all hover:underline">
                  {user.displayName} name
                </p>
                <p className="text-muted-foreground line-clamp-1 break-all">
                  @{user.username}
                </p>
              </div>
            </Link>
          </div>
        </TooltipWrapper>
      )}
      <Linkify>
        {!!user.bio && (
          <div className="text-muted-foreground line-clamp-4 break-words whitespace-pre-line">
            {user.bio}
          </div>
        )}
      </Linkify>

      {user.id !== loggedInUserId && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: !!user.followers.some(
              ({ followerId }) => followerId === loggedInUserId,
            ),
          }}
        />
      )}
    </div>
  );
}
