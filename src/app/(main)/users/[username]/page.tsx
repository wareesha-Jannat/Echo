import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import TrendsSidebar from "@/components/TrendsSidebar";

import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";
import { FollowingData, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { notFound } from "next/navigation";

import { cache } from "react";
import UserPosts from "./UserFeed";
import Linkify from "@/components/Linkify";
import EditProfileButton from "./EditProfileButton";
import DeleteAccountButton from "./DeleteAccountButton";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });
  if (!user) notFound();
  return user;
});

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};
  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}


export default async function Page( {params}: PageProps) {

  const { username}  = await params;
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <>
        <p className="text-destructive mx-auto py-3">
          Yout are not authorized to see this page
        </p>
      </>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s Posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {

  const followerInfo: FollowingData = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="bg-card h-fit w-full space-y-5 rounded-2xl p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
            <div>Member since : {formatDate(user.createdAt, "MMM d, yyy")}</div>
            <div className="flex items-center gap-3">
              <span>
                Posts:{" "}
                <span className="font-semibold">
                  {formatNumber(user._count.posts)}
                </span>
              </span>
              <FollowerCount userId={user.id} initialState={followerInfo} />
            </div>
          </div>
          {user.bio && (
            <>
              <hr />
              <Linkify>
                <div className="overflow-hidden break-words whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            </>
          )}
          {user.id === loggedInUserId && (
               <DeleteAccountButton id={user.id} />
          )}
          
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
    </div>
  );
}
