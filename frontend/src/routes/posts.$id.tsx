import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { useState } from "react";
import { ChatDotsFill, EmojiSmileFill, QuestionCircleFill } from "react-bootstrap-icons";
import { ActionButtons } from "@/components/ActionButtons";
import { clientApi, getHeaders } from "@/main";
import { CenteredLoading } from "@/components/Loading";
import { Container } from "@/components/Container";
import { DisplayMessage } from "@/components/DisplayMessage";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { useDeletePostMutation } from "@/sections/post/useDeletePostMutation";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentEditor } from "@/sections/post/CommentEditor";
import { Thread } from "@/sections/post/Thread";
import { useToast } from "@/hooks/useToast";
import { useLikePost } from "@/mutations/useLikePost";
import { getPostQueryKey } from "@/utils/QueryKeys";

export type CommentPayload = { content: string };

export const Route = createFileRoute("/posts/$id")({
  component: PostRoute,
});

/**
 * Singular post view, shows threads of comments
 * 
 * WIP: Thread-like system in progress
 */
function PostRoute() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation("post");
  const { id } = Route.useParams();
  const [showAddComment, setShowAddComment] = useState(false);
  const [shownReplyEditors, setShownReplyEditors] = useState<{ commentId: number }[] | null>();

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const result = await clientApi.api.post[id].get({
        $headers: await getHeaders()
      });
      return result.data;
    },
    placeholderData: keepPreviousData
  });

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ["post", "replies", id],
    queryFn: async () => {
      const result = await clientApi.api.post[id].comments.get({
        $headers: await getHeaders()
      });
      return result.data;
    },
    placeholderData: keepPreviousData
  });

  const deletePost = useDeletePostMutation();
  const likeMutation = useLikePost(getPostQueryKey(id!));
  const liked = post?.likedByViewer;

  const onComment = async (postId: number, payload: CommentPayload) => {
    const response = await clientApi.api.post[postId].comments.post({
      $headers: await getHeaders(),
      $fetch: {
        body: JSON.stringify(payload)
      }
    });

    if (response.error) {
      toast({
        title: t`newCommentTitle`,
        description: t`newCommentFailure`
      });
    }

    toast({
      title: t`newCommentTitle`,
      description: t`newCommentSuccess`
    });

    await queryClient.invalidateQueries({
      queryKey: ["post"]
    });

    setShowAddComment(false);
  };

  const onReply = async (commentId: number, payload: CommentPayload) => {
    const response = await clientApi.api.comment[commentId].reply.post({
      $headers: await getHeaders(),
      $fetch: {
        body: JSON.stringify(payload)
      }
    });

    if (response.error) {
      toast({
        title: t`newCommentTitle`,
        description: t`newCommentFailure`
      });
    }

    toast({
      title: t`newCommentTitle`,
      description: t`newCommentSuccess`
    });

    await queryClient.invalidateQueries({
      queryKey: ["post", id]
    });

    setShownReplyEditors?.(shownReplyEditors?.filter((reply) => reply.commentId !== commentId));
  }

  if (postLoading) return <CenteredLoading />;

  if (!post && !postLoading) return (<Container>
    <DisplayMessage
      icon={QuestionCircleFill}
      title="Post not found"
      body="The post you are looking for does not exist"
    />
  </Container>);

  return (<div className={twJoin("flex flex-col gap-4", post?.commentCount === 0 && "gap-6")}>
    <div className="w-full flex flex-col gap-4 text-white py-5 px-2 border-b border-b-purple-200">
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage />
          <AvatarFallback>
            <EmojiSmileFill />
          </AvatarFallback>
        </Avatar>

        <span className="truncate">{post?.author?.username}</span>
      </div>

      <div className="px-1 flex flex-col gap-3">
        <span>{post?.text}</span>

        <ActionButtons
          className="self-center md:self-start"
          liked={!!liked}
          likeCount={post?.likes ?? 0}
          commentsCount={post?.commentCount ?? 0}
          onClickComments={() => setShowAddComment(!showAddComment)}
          onLike={() => likeMutation.mutateAsync({ postId: post?.id ?? 0, operation: liked ? "unlike" : "like" })}
          onDelete={post?.authorId === profile?.id ? (async () => await deletePost.mutateAsync(post?.id.toString() ?? "")) : undefined}
        />
      </div>
    </div>

    <div>
      {showAddComment && (
        <CommentEditor
          postId={post?.id ?? 0}
          onComment={onComment}
          onClose={() => setShowAddComment(false)}
        />
      )}

      <div className={showAddComment ? "hidden" : undefined}>
        {threadsLoading ? <CenteredLoading /> : (threads && threads?.length > 0) ? threads.map((comment) => <Thread
          key={comment.id}
          profileId={profile?.id ?? 0}
          onReply={onReply}
          shownReplyEditors={shownReplyEditors ?? []}
          closeReply={(replyId) => setShownReplyEditors?.(shownReplyEditors?.filter((reply) => reply.commentId !== replyId))}
          setShownReplyEditors={(replies) => setShownReplyEditors(replies)}
          thread={{
            id: comment.id,
            author: comment.author,
            authorId: comment.authorId,
            content: comment.content,
            dateCreated: comment.dateCreated,
            updatedAt: comment.updatedAt,
            postId: comment.postId,
            likedByViewer: comment.likedByViewer,
            replies: comment.replies
          }}
        />) : (<DisplayMessage
          icon={ChatDotsFill}
          title={t`noCommentsTitle`}
          body={t`noCommentsDescription`}
        />)}
      </div>
    </div>
  </div>);
}