import { Comment } from "server/schema/comment";
import { ActionButtons } from "@/components/ActionButtons";
import { UsernameAvatar } from "@/components/UsernameAvatar";
import { useDeleteCommentMutation } from "./useDeleteCommentMutation";

type PostCommentProps = {
  profileId: number;
  comment: Comment;
  shownReplies: { commentId: number }[];
  setShownReplies?: (replies: { commentId: number }[]) => void;
};

export const PostComment = ({ 
  comment: { id, likeCount, replyCount, author, authorId, content },
  profileId,
  shownReplies,
  setShownReplies }: PostCommentProps) => {
  const deleteComment = useDeleteCommentMutation();

  return (<div className="px-2 flex gap-2 flex-col">
    <UsernameAvatar username={author?.username ?? ""} avatarUrl={author?.avatarUrl ?? null} />
    <p className="text-sm pl-10 pr-2 whitespace-pre-wrap">{content}</p>

    <div className="self-end">
      <ActionButtons
        // TODO: Like mechanism on comment level
        liked={false}
        likeCount={likeCount ?? 0}
        commentsCount={replyCount ?? 0}
        onClickComments={setShownReplies ? (() => setShownReplies([...shownReplies, { commentId: id }])) : undefined}
        onDelete={
          (profileId === authorId || authorId === profileId) ?
            (() => deleteComment.mutateAsync(id.toString())) : undefined
        }
      />
    </div>
  </div>);
}