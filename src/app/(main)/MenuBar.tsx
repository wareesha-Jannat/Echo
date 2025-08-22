import { Button } from "@/components/ui/button";
import { Bell, Bookmark, Ghost, Home, Mail, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import NotificationButton from "./NotificationsButtons";
import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import MessagesButton from "./MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenuBarProps {
  className?: string;
}
const MenuBar = async ({ className }: MenuBarProps) => {
  const { user } = await validateRequest();
  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    streamServerClient
      .getUnreadCount(user.id)
      .then((res) => res.total_unread_count),
  ]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start sm:gap-3"
        title="home"
        asChild
      >
        <Link href={"/"}>
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <NotificationButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      <Button
        variant="ghost"
        className="flex items-center justify-start sm:gap-3"
        title="bookmarks"
        asChild
      >
        <Link href={"/bookmarks"}>
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start sm:gap-3"
        title="profile"
        asChild
      >
        <Link href={`/users/${user.username}`}>
          <User />
          <span className="hidden lg:inline">Profile</span>
        </Link>
      </Button>
    </div>
  );
};

export default MenuBar;
