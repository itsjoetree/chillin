import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useLikePostMutation } from "./useLikePostMutation";
import { useDeletePostMutation } from "./useDeletePostMutation";
import { FeedCard } from "@/components/FeedCard";
import { Post } from "server/schema/post";

type FeedPostProps = {
  /**
   * The post to display
   */
  post: Post;
}

/**
 * Displays a post in the profile feed.
 */
export const FeedPost = ({ post }: FeedPostProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const likeMutation = useLikePostMutation();
  const likedByViewer = (likeMutation?.isPending && likeMutation.variables.postId === post.id.toString())
    ? !post.likedByViewer
      : post.likedByViewer;
  
  const deletePost = useDeletePostMutation();

  return (<FeedCard
      key={post.id}
      username={post?.author?.username ?? ""}
      avatarUrl={post?.author?.avatarUrl ?? null}
      post={post}
      viewerLiked={likedByViewer}
      onDelete={profile?.username === post?.author?.username ? (async () => await deletePost.mutateAsync(post.id.toString())) : undefined}
      onLike={async () => await likeMutation.mutateAsync({ postId: post.id.toString(), operation: likedByViewer ? "unlike" : "like" })}
      onClickComments={() => navigate({
        to: "/posts/$id",
        params: {
          id: post.id.toString()
        }
      })}
    />);
}