import { Prisma } from "@prisma/client";

import { ChannelData } from "stream-chat";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    username: true,
    displayName: true,
    avatarUrl: true,
    id: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        followers: true,
        posts: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getpostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
    },
    _count: {
      select: {
        likes: true,
        commmets: true
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getpostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}
export interface PostsPageWithMoods extends PostsPage {
 moods : string[];
}

export const notificationInclude ={
  issuer : {
    select : {
      username : true,
      displayName : true,
      avatarUrl : true
    }
  }, post : {
    select : {
      content : true
    }
  }
} satisfies Prisma.NotificationInclude

export type NotificationData = Prisma.NotificationGetPayload<{include : typeof notificationInclude}>

export interface NotificationPage {
  notifications : NotificationData[],
  nextCursor : string | null
}

export interface NotificationCountInfo {
  unreadCount : number
}
export function GetCommentDataInclude(loggedInUserId: string){
  return {
    user : {
        select : getUserDataSelect(loggedInUserId)
    }
  } satisfies Prisma.CommentInclude
}

export type CommentData =  Prisma.CommentGetPayload<{
include : ReturnType<typeof GetCommentDataInclude>
}> 

export interface CommentPage{
 comments : CommentData[];
 nextCursor : string | null
}

export interface FollowingData {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeData {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export type MyChannelData = ChannelData & { name : string}

export interface UserAuth {
   id : string,
    username : string,
    displayName : string,
    avatarUrl : string | null,
    googleId : string | null
}

export interface SessionAuth {
  id : string
}