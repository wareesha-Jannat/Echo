"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Home } from "lucide-react";
import MessagesButton from "./MessagesButton";
import NotificationButton from "./NotificationsButtons";
import { Bookmark, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAuth } from "@/lib/types";

interface MenubarButtonsProps {
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  user: UserAuth;
}

const MenubarButtons = ({
  unreadNotificationsCount,
  unreadMessagesCount,
  user,
}: MenubarButtonsProps) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <Button
        variant="ghost"
        className={`flex items-center justify-start sm:gap-3 ${isActive("/") ? "bg-accent text-accent-foreground" : ""}`}
        title="home"
        asChild
      >
        <Link href={"/"}>
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} isActive={isActive} />
      <NotificationButton
        initialState={{ unreadCount: unreadNotificationsCount }} isActive={isActive} 
      />
      <Button
        variant="ghost"
        className={`flex items-center justify-start sm:gap-3 ${isActive("/bookmarks") ? "bg-accent text-accent-foreground" : ""}`}
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
        className={`flex items-center justify-start sm:gap-3 ${isActive(`/users/${user.username}`) ? "bg-accent text-accent-foreground" : ""}`}
        title="profile"
        asChild
      >
        <Link href={`/users/${user.username}`}>
          <User />
          <span className="hidden lg:inline">Profile</span>
        </Link>
      </Button>
    </>
  );
};

export default MenubarButtons;
