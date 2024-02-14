import { Comment } from "server/schema/comment";
import { ActionButtons } from "@/components/ActionButtons";
import { UsernameAvatar } from "@/components/UsernameAvatar";
import { useDeleteCommentMutation } from "./useDeleteCommentMutation";
import { useMutation } from "@tanstack/react-query";
import { clientApi, getHeaders } from "@/main";

type PostCommentProps = {
  profileId: number;
  comment: Comment;
  shownReplies: { commentId: number }[];
  setShownReplies: (replies: { commentId: number }[]) => void;
};

export const PostComment = ({ 
  comment: { id, likedByViewer, likeCount, replyCount, author, authorId, content },
  profileId,
  shownReplies,
  setShownReplies }: PostCommentProps) => {
  const deleteComment = useDeleteCommentMutation();
  
  const likeMutation = useMutation({
    onMutate: async (vars: { id: string; operation: "like" | "unlike" }) => {
      const resp = vars.operation === "unlike" ? await clientApi.api.comment[vars.id].unlike.delete({
        $headers: await getHeaders()
      }) : await clientApi.api.comment[vars.id].like.post({
        $headers: await getHeaders()
      });

      if (resp.error) {
        throw new Error();
      }
    }
  });

  const liked = likeMutation?.isPending && likeMutation.variables.id === id.toString() ? !likedByViewer : likedByViewer;

  return (<div className="px-2 py- flex gap-2 flex-col">
    <UsernameAvatar username={author?.username ?? ""} avatarUrl={author?.avatarUrl ?? null} />
    <p className="text-sm pl-10 pr-2 whitespace-pre-wrap">{content}</p>

    <div className="self-end">
      <ActionButtons
        liked={!!liked}
        likeCount={likeCount ?? 0}
        commentsCount={replyCount ?? 0}
        onClickComments={setShownReplies ? (() => setShownReplies([...shownReplies, { commentId: id }])) : undefined}
        onDelete={
          (profileId === authorId || authorId === profileId) ?
            (() => deleteComment.mutateAsync(id.toString())) : undefined
        }
        onLike={() => likeMutation.mutateAsync({
          id: id.toString(),
          operation: likedByViewer ? "unlike" : "like"
        })}
      />
    </div>
  </div>);
}