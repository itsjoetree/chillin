import { type Post } from "../../../server/models/Post";
import { type User } from "../../../server/models/User";
import { ComponentPropsWithoutRef, useState } from "react";
import { Card } from "./Card";
import { twMerge } from "tailwind-merge";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { EmojiSmileFill } from "react-bootstrap-icons";
import { ActionButtons } from "./ActionButtons";

type FeedCardProps = ComponentPropsWithoutRef<"div"> & { commentsCount: number; post: Post } & Pick<User, "username" | "avatarUrl">

const FeedCard = ({
  className,
  username,
  avatarUrl,
  commentsCount,
  post: { likes, text,  },
}: FeedCardProps) => {
  const [liked, setLiked] = useState(false);

  return (<Card className={twMerge("flex flex-col gap-4", className)}>
    <div className="flex gap-2 items-center">
      <Avatar>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <EmojiSmileFill />
        </AvatarFallback>
      </Avatar>

      <span className="truncate">{username}</span>
    </div>

    {text}

    <ActionButtons
      onClickComments={() => console.log("clicked comments")}
      onLike={() => setLiked(!liked)}
      liked={liked}
      likeCount={likes}
      commentsCount={commentsCount}
    />
  </Card>);
}

export { FeedCard }