import { ComponentPropsWithoutRef } from "react";
import { ChatDotsFill, Heart, HeartFill } from "react-bootstrap-icons";
import { twMerge } from "tailwind-merge";

type ActionButtonsProps = ComponentPropsWithoutRef<"div"> & {
  liked: boolean;
  likeCount: number;
  commentsCount: number;
  onClickComments: () => void;
  onLike: () => void;
}

/**
 * Displays action buttons for a post
 */
const ActionButtons = ({ liked, commentsCount, likeCount, onClickComments, onLike, className, ...props }: ActionButtonsProps) => {

  return (<div {...props} className={twMerge("flex gap-3", className)}>
    <button onClick={onClickComments} className="flex gap-2 items-center">
      <ChatDotsFill />
      {commentsCount > 0 && <span>{commentsCount}</span>}
    </button>

    <button className="flex gap-2 items-center" onClick={onLike}>
      {liked ? <HeartFill className="text-purple-200" /> : <Heart />}
      {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
    </button>
  </div>)
}

export { ActionButtons }