import { ComponentPropsWithoutRef, ReactNode, createElement, isValidElement } from "react";
import { ChatDotsFill, Heart, HeartFill, Trash3Fill } from "react-bootstrap-icons";
import { twMerge } from "tailwind-merge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./AlertDialog";
import { useTranslation } from "react-i18next";

type ActionButtonsProps = ComponentPropsWithoutRef<"div"> & {
  liked: boolean;
  likeCount: number;
  commentsWrapper?: ReactNode;
  commentsCount: number;
  onLike: () => void;
  onDelete?: () => void;
}

/**
 * Displays action buttons for a post
 */
const ActionButtons = ({ liked, commentsCount, likeCount, onLike, className, commentsWrapper, onDelete, ...props }: ActionButtonsProps) => {
  const { t } = useTranslation("post");
  
  const commentsContent = <span className="flex gap-2 items-center">
    <ChatDotsFill />
    {commentsCount > 0 && <span>{commentsCount}</span>}
  </span>

  return (<div {...props} className={twMerge("flex gap-3", className)}>
    {
      isValidElement(commentsWrapper) ? createElement(commentsWrapper.type, {
        title: "Comments",
        ...commentsWrapper.props
      }, commentsContent) : commentsContent
    }

    <button type="button" className="flex gap-2 items-center" onClick={onLike}>
      {liked ? <HeartFill title={t`unlike`} className="text-purple-200" /> : <Heart title={t`like`} />}
      {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
    </button>

    {
      onDelete && (<AlertDialog>
        <AlertDialogTrigger title={t`delete`}>
          <Trash3Fill />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t`deleteTitle`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`deleteDescription`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t`cancel`}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>{t`confirm`}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>)
    }
  </div>);
}

export { ActionButtons }