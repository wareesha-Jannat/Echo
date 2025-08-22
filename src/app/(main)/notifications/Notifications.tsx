"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import LoadingSkeleton from "@/components/posts/editor/LoadingSkeleton";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import { NotificationPage, PostsPage } from "@/lib/types";
import {
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import Notification from "./Notification";

const Notifications = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["Notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/notifications`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const notifications = data?.pages.flatMap((n) => n.notifications) || [];

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch(`/api/notifications/mark-as-read`),
    onSuccess: () => {
      const queryKey: QueryKey = ["unread-notifications-count"];
      queryClient.setQueryData(queryKey, () => ({ unreadCount: 0 }));
    },
  });
  useEffect(() => {
    mutate();
  }, [mutate]);

  if (status === "pending") {
    return (
      <div>
        <LoadingSkeleton />
      </div>
    );
  }
  if (status === "success" && !hasNextPage && !notifications.length) {
    return (
      <p className="text-muted-foreground text-center">No notifications yet</p>
    );
  }
  if (status === "error") {
    return (
      <div className="text-destructive text-center">
        <p>Error Loading notifications</p>
      </div>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((n) => (
        <Notification key={n.id} notification={n} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
};

export default Notifications;
