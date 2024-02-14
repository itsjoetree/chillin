import { CommentThread } from "server/types";
import { PostComment } from "./PostComment";
import { CommentPayload } from "@/routes/posts.$id";
import { CommentEditor } from "./CommentEditor";

type ThreadProps = {
  thread: CommentThread;
  profileId: number;
  closeReply: (replyId: number) => void;

  /**
   * Callback once a comment is posted in editor
   */
  onReply: (commentId: number, payload: CommentPayload) => Promise<void>;

  /**
   * Currently opened comment editors
   */
  shownReplyEditors?: { commentId: number }[];

  /**
   * Sets opened comment editor for a comment in the parent component
   */
  setShownReplyEditors?: (replies: { commentId: number }[]) => void;
};

/**
 * Displays comments and replies recursively
 */
export const Thread = ({ thread, profileId, shownReplyEditors, onReply, closeReply, setShownReplyEditors }: ThreadProps) => {
  const showReply = shownReplyEditors?.some((reply) => reply.commentId === thread.id);

  return (<div className="flex flex-col gap-4">
    <PostComment
      comment={{
        id: thread.id,
        authorId: thread.authorId,
        author: thread.author,
        content: thread.content,
        dateCreated: thread.dateCreated,
        updatedAt: thread.updatedAt,
        postId: thread.postId,
        likedByViewer: thread.likedByViewer
      }}
      setShownReplies={setShownReplyEditors!}
      shownReplies={shownReplyEditors!}
      profileId={profileId}
    />

    {showReply && (
      <CommentEditor commentId={thread.id} onReply={onReply} onClose={() => closeReply(thread.id)} />
    )}

    {Array.isArray(thread.replies) && thread.replies.length > 0 && thread.replies.map((reply) => (<div className="pl-2" key={reply.id}>
      <Thread
        shownReplyEditors={shownReplyEditors}
        setShownReplyEditors={setShownReplyEditors}
        closeReply={closeReply}
        thread={reply}
        profileId={profileId}
        onReply={onReply}
      />
    </div>))}
  </div>);
}
