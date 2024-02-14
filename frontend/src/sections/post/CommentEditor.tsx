import { PostEditor } from "@/components/PostEditor";
import { useAuth } from "@/hooks/useAuth";
import { CommentPayload } from "@/routes/posts.$id";
import { useLocalizeError } from "@/utils/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { commentSchema } from "server/schema/comment";

type CommentEditorProps = {
  /**
   * Id of post to reply to
   */
  postId: number;

  /**
   * Callback to post the comment
   */
  onComment: (postId: number, payload: CommentPayload) => Promise<void>;

  /**
   * Callback to close the editor
   */
  onClose: () => void;
} | {
  /**
   * Id of comment to reply to
   */
  commentId: number;

  /**
   * Callback to post the comment
   */
  onReply: (commentId: number, payload: CommentPayload) => Promise<void>;

  /**
 * Callback to close the editor
 */
  onClose: () => void;
};

/**
 * Editor for creating a new comment or reply
 */
export const CommentEditor = ({ onClose, ...props }: CommentEditorProps) => {
  const { profile } = useAuth();
  const { localizeError } = useLocalizeError();
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CommentPayload>(
    { resolver: zodResolver(commentSchema, { errorMap: localizeError }) }
  );

  // const onSubmit = async (data: { content: string }) => {
  //   const response = await clientApi.api.post[postId].comments.post({
  //     $headers: await getHeaders(),
  //     $fetch: {
  //       body: JSON.stringify(data)
  //     }
  //   });

  //   if (response.error) {
  //     toast({
  //       title: t`newCommentTitle`,
  //       description: t`newCommentFailure`,
  //     });

  //     return;
  //   }

  //   toast({
  //     title: t`newCommentTitle`,
  //     description: t`newCommentSuccess`,
  //   })

  //   onClose();

  //   queryClient.invalidateQueries({ queryKey: ["post", id] });
  // }

  const onSubmit = async (payload: CommentPayload) => {
    if ("postId" in props && "onComment" in props) {
      await props.onComment(props.postId, payload);
    } else if ("commentId" in props && "onReply" in props) {
      await props.onReply(props.commentId, payload);
    }
  };

  return (<form className="p-2 py-5" onSubmit={handleSubmit(onSubmit)}>
    <Controller
      name="content"
      control={control}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <>
          {error && <div className="text-sm text-purple-200">{error?.message}</div>}
          <PostEditor
            onClose={onClose}
            username={profile?.username ?? ""}
            avatarUrl={profile?.avatarUrl ?? null}
            disableSubmit={isSubmitting}
            onInputUpdate={(content) => onChange(content)}
          />
        </>
      )}
    />
  </form>);
}