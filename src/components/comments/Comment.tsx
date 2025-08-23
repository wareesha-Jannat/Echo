import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import React from "react";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}
const Comment = ({ comment }: CommentProps) => {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/api/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl || comment.user.displayName?.[0]} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-3 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={`/api/users/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        {comment.content}
      </div>
      {comment.userId === user.id && (
        <CommentMoreButton comment={comment} className="ml-auto" />
      )}
    </div>
  );
};

export default Comment;
