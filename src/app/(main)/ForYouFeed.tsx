"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import LoadingSkeleton from "@/components/posts/editor/LoadingSkeleton";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import { PostsPageWithMoods } from "@/lib/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useQod } from "./QodContext";

const ForYouFeed = () => {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const { qod } = useQod();
  const queryClient = useQueryClient();
  const cachedQuestion = queryClient.getQueryData<{ question: string }>([
    "question-of-the-day",
  ]);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPageWithMoods>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) || [],
    [data?.pages],
  );

  const moods = data?.pages[0].moods || [];

  function normalizedMood(mood: string) {
    return mood
      ?.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u24C2|[\u2600-\u26FF])/g,
        "",
      )
      .toLowerCase()
      .trim();
  }

  let filteredPosts = useMemo(() => {
    if (qod) return posts.filter((p) => p.qod === cachedQuestion?.question);

    if (!selectedMoods.length) {
      return posts;
    }
    return posts.filter(
      (p) =>
        p.mood &&
        selectedMoods.some(
          (m) => normalizedMood(m) === normalizedMood(p.mood!),
        ),
    );
  }, [posts, selectedMoods, qod, cachedQuestion?.question]);

  const uniqueMoods = useMemo(() => {
    const seen = new Set<string>();
    return moods.filter((mood) => {
      const normalized = normalizedMood(mood);

      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }, [moods]);

  if (status === "pending") {
    return (
      <div>
        <LoadingSkeleton />
      </div>
    );
  }
  if (status === "success" && !hasNextPage && !posts.length) {
    return (
      <p className="text-muted-foreground text-center">
        No one has posted anything yet.
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="text-destructive text-center">
        <p>Error Loading posts</p>
      </div>
    );
  }

  return (
    <>
      <MoodFilters
        moods={uniqueMoods}
        selectedMoods={selectedMoods}
        setSelectedMoods={setSelectedMoods}
      />
      <InfiniteScrollContainer
        className="space-y-5"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {filteredPosts.length === 0 && !isFetchingNextPage ? (
          <p className="text-muted-foreground text-center">
            {qod
              ? "No one has answered this question yet."
              : "No posts match your selected moods."}
          </p>
        ) : (
          filteredPosts.map((post) => <Post key={post.id} post={post} />)
        )}
        {isFetchingNextPage && (
          <Loader2 className="mx-auto my-3 animate-spin" />
        )}
      </InfiniteScrollContainer>
    </>
  );
};

export default ForYouFeed;

interface MoodFiltersProps {
  moods: string[];
  selectedMoods: string[];
  setSelectedMoods: React.Dispatch<React.SetStateAction<string[]>>;
  //  onSelected : (values : string[])=>void by using this we will not be able to use prev
}

function MoodFilters({
  moods,
  selectedMoods,
  setSelectedMoods,
}: MoodFiltersProps) {
  const handleClick = (m: string) => {
    setSelectedMoods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const moodList = useMemo(
    () => (moods.length > 4 ? [...moods, ...moods] : moods),
    [moods],
  );

  return (
    <>
      <div className="bg-card flex w-full items-center overflow-hidden rounded-2xl px-5 py-2">
        {moods.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No moods available yet.
          </p>
        ) : (
          <div
            className={`${moods.length < 4 ? "" : "animate-infinite-scroll"} scroll-hide flex flex-nowrap gap-3 scroll-smooth`}
          >
            {moodList.map((m, i) => {
              const isSelected = selectedMoods.includes(m);
              return (
                <button
                  key={i}
                  className={`w-fit rounded-2xl border px-3 py-2 whitespace-nowrap transition-colors ${isSelected ? "bg-primary border-primary text-white" : "bg-secondary hover:bg-secondary/80 border-border text-foreground shadow-sm"} `}
                  onClick={() => handleClick(m)}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
