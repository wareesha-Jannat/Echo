import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { unstable_cache } from "next/cache";
import { formatNumber } from "@/lib/utils";
import FollowButton from "./FollowButton";
import TooltipWrapper from "./TooltipWrapper";

const TrendsSidebar = () => {
  return (
    <div className="sticky top-21 hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
};

async function WhoToFollow() {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: loggedInUser.id,
      },
    },
    select: getUserDataSelect(loggedInUser.id),
    take: 5,
  });

  return (
    <div className="bg-card space-y-5 rounded-2xl p-5 shadow-sm">
      <div className="text-xl font-bold">Who to Follow</div>
      {usersToFollow.length === 0 && <p>No users to Follow</p>}
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <TooltipWrapper user={user}>
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 font-semibold break-all hover:underline">
                  {user.displayName}
                </p>
                <p className="text-muted-foreground line-clamp-1 break-all">
                  @{user.username}
                </p>
              </div>
            </Link>
          </TooltipWrapper>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === loggedInUser.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
  SELECT LOWER(match[1]) AS hashtag, COUNT(*) AS count
  FROM posts,
  LATERAL regexp_matches(content, '#[[:alnum:]_]+', 'g') AS match
  GROUP BY hashtag
  ORDER BY count DESC, hashtag ASC
  LIMIT 5;
`;
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  { revalidate: 3 * 60 * 60 },
);
async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="bg-card space-y-5 rounded-2xl p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];
        return (
          <Link
            key={title}
            href={`/search?q=${encodeURIComponent("#" + title)}`}
            className="block"
          >
            <p
              className="font-semibold break-all hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export default TrendsSidebar;
