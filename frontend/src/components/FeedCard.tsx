import { type Post } from "server/schema/post";
import { type Profile } from "server/schema/profile";
import { ComponentPropsWithoutRef } from "react";
import { Card } from "./Card";
import { twMerge } from "tailwind-merge";
import { ActionButtons } from "./ActionButtons";
import { UsernameAvatar } from "./UsernameAvatar";

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
  post: { likes, text, commentCount  },
}: FeedCardProps) => {

  return (<Card className={twMerge("flex flex-col gap-4", className)}>
    <UsernameAvatar username={username} avatarUrl={avatarUrl} />

    {text}

    <ActionButtons
      liked={!!viewerLiked}
      onDelete={onDelete}
      onLike={onLike}
      className="self-end lg:self-start"
      likeCount={likes}
      commentsCount={commentCount}
    />
  </Card>);
}

export { FeedCard }