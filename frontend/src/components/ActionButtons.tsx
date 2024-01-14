import { ComponentPropsWithoutRef, ReactNode, createElement, isValidElement } from "react";
import { ChatDotsFill, Heart, HeartFill } from "react-bootstrap-icons";
import { twMerge } from "tailwind-merge";

type ActionButtonsProps = ComponentPropsWithoutRef<"div"> & {
  liked: boolean;
  likeCount: number;
  commentsWrapper?: ReactNode;
  commentsCount: number;
  onLike: () => void;
}

/**
 * Displays action buttons for a post
 */
const ActionButtons = ({ liked, commentsCount, likeCount, onLike, className, commentsWrapper, ...props }: ActionButtonsProps) => {
  const commentsContent = <span className="flex gap-2 items-center">
    <ChatDotsFill />
    {commentsCount > 0 && <span>{commentsCount}</span>}
  </span>

  return (<div {...props} className={twMerge("flex gap-3", className)}>
    {
      isValidElement(commentsWrapper) ? createElement(commentsWrapper.type, {
        ...commentsWrapper.props
      }, commentsContent) : commentsContent
    }

    <button className="flex gap-2 items-center" onClick={onLike}>
      {liked ? <HeartFill className="text-purple-200" /> : <Heart />}
      {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
    </button>
  </div>)
}

export { ActionButtons }