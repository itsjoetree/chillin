import { ComponentPropsWithoutRef } from "react";
import { ChatDotsFill, Heart, HeartFill, Trash3Fill } from "react-bootstrap-icons";
import { twMerge } from "tailwind-merge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./AlertDialog";
import { useTranslation } from "react-i18next";

type ActionButtonsProps = ComponentPropsWithoutRef<"div"> & {
  liked: boolean;
  likeCount: number;
  onClickComments?: () => void;
  commentsCount: number;
  onLike: () => void;
  onDelete?: () => void;
}

/**
 * Displays action buttons for a post
 */
const ActionButtons = ({ liked, commentsCount, likeCount, onLike, className, onClickComments, onDelete, ...props }: ActionButtonsProps) => {
  const { t } = useTranslation("post");

  return (<div {...props} className={twMerge("flex gap-3", className)}>
    <button type="button" onClick={onClickComments}>
      <span className="flex gap-2 items-center">
        <ChatDotsFill className="h-4 w-4" />
        {commentsCount > 0 && <span className="text-xs">{commentsCount}</span>}
      </span>
    </button>

    <button type="button" className="flex gap-2 items-center" onClick={onLike}>
      {liked ? <HeartFill title={t`unlike`} className="text-purple-200 h-4 w-4" /> : <Heart className="h-4 w-4" title={t`like`} />}
      {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
    </button>

    {
      onDelete && (<AlertDialog>
        <AlertDialogTrigger title={t`delete`}>
          <Trash3Fill className="h-4 w-4" />
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