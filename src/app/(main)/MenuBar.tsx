import React from "react";
import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import MenubarButtons from "./MenubarButtons";

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
      <MenubarButtons
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        user={user}
      />
    </div>
  );
};

export default MenuBar;
