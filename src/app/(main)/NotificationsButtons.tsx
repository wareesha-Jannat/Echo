"use client";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationButton({
  initialState,
}: NotificationButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () =>
      kyInstance
        .get(`/api/notifications/unread-count`)
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });
  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start sm:gap-3"
      title="notification"
      asChild
    >
      <Link href={"/notifications"}>
        <div className="relative">
          <Bell />
          {!!data.unreadCount && (
            <span className="text-primary bg-primary-foreground absolute -top-1 -right-1 rounded-full px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>

        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  );
}
