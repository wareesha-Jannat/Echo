"use client";
import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import UserTooltip from "../UserTooltip";
import Linkify from "../Linkify";
import { Media } from "@prisma/client";
import Image from "next/image";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Comments from "../comments/Comments";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post bg-card m-3 space-y-3 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/post/${post.id}`}
              className="text-muted-foreground block text-sm hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="md:opacity-0 md:transition-opacity md:group-hover/post:opacity-100"
          />
        )}
      </div>
      {post.mood && (
        <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          {post.mood}
        </span>
      )}

      <Linkify>
        <div className="break-words whitespace-pre-line"> {post.content}</div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr />
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: !!post.likes.some(
                (like) => like.userId === user.id,
              ),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>

        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: !!post.bookmarks.length,
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid-col-2 sm:grid",
      )}
    >
      {attachments.map((a) => (
        <MediaPreview key={a.id} media={a} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}
function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Atachment"
        height={500}
        width={500}
        className="mx-auto size-fit max-h-120 rounded-2xl"
      />
    );
  }
  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          className="mx-auto size-fit max-h-120 rounded-2xl"
        />
      </div>
    );
  }
  return <p className="text-destructive">Unsupported Media Format</p>;
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.commmets}{" "}
        <span className="hidden md:inline">Comments</span>
      </span>
    </button>
  );
}
