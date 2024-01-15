import { type Post } from "../../../server/models/Post";
import { type User } from "../../../server/models/User";
import { ComponentPropsWithoutRef, useState } from "react";
import { Card } from "./Card";
import { twMerge } from "tailwind-merge";
import { ActionButtons } from "./ActionButtons";
import { UsernameAvatar } from "./UsernameAvatar";

type FeedCardProps = ComponentPropsWithoutRef<"div"> & { 
  onDelete?: () => void;
  onLike: () => void;
  onClickComments: () => void;
  commentsCount: number;
  post: Post; } & 
  Pick<User, "username" | "avatarUrl">

const FeedCard = ({
  className,
  username,
  avatarUrl,
  commentsCount,
  onLike,
  onDelete,
  post: { likes, text,  },
}: FeedCardProps) => {
  const [liked, setLiked] = useState(false);

  return (<Card className={twMerge("flex flex-col gap-4", className)}>
    <UsernameAvatar username={username} avatarUrl={avatarUrl} />

    {text}

    <ActionButtons
      onDelete={onDelete}
      className="self-end lg:self-start"
      onLike={() => { 
        setLiked(!liked)
        onLike()
      }}
      liked={liked}
      likeCount={likes}
      commentsCount={commentsCount}
    />
  </Card>);
}

export { FeedCard }