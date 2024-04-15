import { type Post } from "server/schema/post";
import { type Profile } from "server/schema/profile";
import { ComponentPropsWithoutRef } from "react";
import { Card } from "./Card";
import { twMerge } from "tailwind-merge";
import { ActionButtons } from "./ActionButtons";
import { UsernameAvatar } from "./UsernameAvatar";
import { getFormattedDateFrom } from "@/utils/Dates";

type FeedCardProps = ComponentPropsWithoutRef<"div"> & { 
  onDelete?: () => void;
  onLike: () => void;
  onClickComments: () => void;
  viewerLiked?: boolean;
  post: Post; } & 
  Pick<Profile, "username" | "avatarUrl">

const FeedCard = ({
  className,
  username,
  avatarUrl,
  viewerLiked,
  onLike,
  onDelete,
  onClickComments,
  post: { likes, text, commentCount, updatedAt, dateCreated },
}: FeedCardProps) => {

  return (<Card className={twMerge("flex flex-col gap-4", className)}>
    <div className="flex gap-1 items-center">
      <UsernameAvatar username={username} avatarUrl={avatarUrl} />
      {(updatedAt || dateCreated) && <span className="text-xs">&#x2022; {getFormattedDateFrom(updatedAt ?? dateCreated!)}</span>}
    </div>
    
    <p className="whitespace-pre-wrap">
      {text}
    </p>

    <ActionButtons
      liked={!!viewerLiked}
      onClickComments={onClickComments}
      onDelete={onDelete}
      onLike={onLike}
      className="self-end lg:self-start"
      likeCount={likes}
      commentsCount={commentCount}
    />
  </Card>);
}

export { FeedCard }