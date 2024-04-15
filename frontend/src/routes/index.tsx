import { FeedCard } from "@/components/FeedCard";
import { useAuth } from "@/hooks/useAuth";
import { clientApi, getHeaders } from "@/main";
import { CheckCircleFill, EnvelopeSlashFill, VectorPen } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { InfiniteData, UseMutateAsyncFunction, useInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { DisplayMessage } from "@/components/DisplayMessage";
import { SignIn } from "../sections/auth/SignIn";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { CenteredLoading } from "@/components/Loading";
import { useDeletePostMutation } from "@/sections/post/useDeletePostMutation";
import { useLikeFeedPost } from "@/mutations/useLikeFeedPost";
import { Post } from "server/schema/post";
import { Fragment, useState } from "react";
import { getPostFeedQueryKey } from "@/utils/QueryKeys";
import { FeedResponse } from "server/controllers/feeds";

export const Route = createFileRoute("/")({
  component: Home,
});

const UnauthView = () => {

  return (<div className="flex flex-col gap-4">
    <div className="flex flex-col gap-4">
      <Logo size="lg" />
      <SignIn />
    </div>
  </div>)
};

type FeedItemMutations = {
  onToggleLike: UseMutateAsyncFunction<void, Error, {
    postId: number;
    operation: "like" | "unlike";
  }, {
      prev:  InfiniteData<FeedResponse, unknown> | undefined;
  }>;
  onDelete: UseMutateAsyncFunction<void, Error, string, unknown>;
}

type FeedItemProps = {
  post: Post;
} & FeedItemMutations;

/**
 * Item to be displayed in feed.
 */
const FeedItem = ({ onToggleLike, onDelete, post }: FeedItemProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <FeedCard
      key={post.id}
      username={post.author?.username ?? ""}
      avatarUrl={post?.author?.avatarUrl ?? ""}
      post={post}
      viewerLiked={post.likedByViewer}
      onLike={async () => await onToggleLike({
        postId: post.id,
        operation: post.likedByViewer ? "unlike" : "like"
      })}
      onDelete={post.authorId === profile?.id ? (async () => await onDelete(post.id.toString())) : undefined}
      onClickComments={() => navigate({
        to: "/posts/$id",
        params: {
          id: post.id.toString()
        }
      })}
    />
  )
}

/**
 * Component for displaying old posts
 */
const OldPosts = ({ onToggleLike, onDelete, visible }: {
  /**
   * To properly show old posts when user reaches end of feed, this component should be mounted
   * but not visible, this prop is used to control visibility.
   */
  visible?: boolean;
} & FeedItemMutations) => {
  const { t } = useTranslation("post");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: [...getPostFeedQueryKey, "old"],
    queryFn: async ({ pageParam })  => {
      const headers = await getHeaders();
  
      const resp = await clientApi.api.feed.get({
        $headers: headers,
        $query: {
          ...(pageParam ? { cursor: pageParam.toString() } : {}),
          showOlder: "true"
        } 
      });
  
      return resp.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as number | undefined,
  });

  const hasSomeData = data?.pages?.some((page) => page?.items?.length);

  if (isLoading)
    return <CenteredLoading />;

  if (!visible || !hasSomeData)
    return;

  return (<div className="flex flex-col gap-4">
    <div className="border-b border-b-white pb-2">
      <h2>Old Posts</h2>
    </div>
    {
      (data?.pages?.length && hasSomeData) ? data?.pages?.map((page, i) => (
        <Fragment key={i}>
          {page?.items?.map((post) => (
            <FeedItem key={post.id} post={post} onToggleLike={onToggleLike} onDelete={onDelete} />
          ))}
        </Fragment>
      )) : (<DisplayMessage
        icon={EnvelopeSlashFill}
        title={t("noPostsTitle", { ns: "feed" })}
        body={t("noPostsDescription", { ns: "feed" })}
      />)
    }

    {(hasNextPage && !isFetchingNextPage) && <button
      onClick={() => fetchNextPage()}
      className="text-purple-200">Load More...</button>}

    {isFetchingNextPage && <CenteredLoading />}    
  </div>);
}

/**
 * Component for displaying new posts
 */
const NewPosts = ({
  onFeedEnd,
  onToggleLike,
  onDelete
}: {
  /**
   * Callback for when feed ends
   */
  onFeedEnd: () => void;
} & FeedItemMutations) => {
  const { t } = useTranslation("post");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: [...getPostFeedQueryKey, "new"],
    queryFn: async ({ pageParam })  => {
      const headers = await getHeaders();
  
      const resp = await clientApi.api.feed.get({
        $headers: headers,
        $query: pageParam ? { cursor: pageParam.toString() } : {}
      });
  
      return resp.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.cursor) {
        onFeedEnd();
      }

      return lastPage?.cursor;
    },
    initialPageParam: undefined as number | undefined,
  });

  const hasSomeData = data?.pages?.some((page) => page?.items?.length);

  if (isLoading)
    return <CenteredLoading />;

  return (<>
    {
      (data?.pages?.length && hasSomeData) ? data?.pages?.map((page, i) => (
        <Fragment key={i}>
          {page?.items?.map((post) => (
            <FeedItem key={post.id} post={post} onToggleLike={onToggleLike} onDelete={onDelete} />
          ))}
        </Fragment>
      )) : (<DisplayMessage
        icon={EnvelopeSlashFill}
        title={t("noPostsTitle", { ns: "feed" })}
        body={t("noPostsDescription", { ns: "feed" })}
      />)
    }

    {(hasNextPage && !isFetchingNextPage) && <button
      onClick={() => fetchNextPage()}
      className="text-purple-200">Load More...</button>}

    {isFetchingNextPage && <CenteredLoading />}

    {!hasNextPage && hasSomeData && (
      <DisplayMessage
        icon={CheckCircleFill}
        title={t("allCaughtUpTitle", { ns: "feed" })}
        body={t("allCaughtUpDescription", { ns: "feed" })}
      />
    )}
  </>);
}

/**
 * Authenticated view for root route, displays feed.
 */
const AuthenticatedView = () => {
  const [endOfNewFeed, setEndOfNewFeed] = useState(false);
  const setNewFeedEnd = () => setEndOfNewFeed(true);

  const likePostMutation = useLikeFeedPost([...getPostFeedQueryKey, "new"]);
  const likeOldPostMutation = useLikeFeedPost([...getPostFeedQueryKey, "old"]);

  const deletePost = useDeletePostMutation();

  return (<div className="flex flex-col gap-4 relative">
    <NewPosts onToggleLike={likePostMutation.mutateAsync} onDelete={deletePost.mutateAsync} onFeedEnd={setNewFeedEnd} />
    <OldPosts onToggleLike={likeOldPostMutation.mutateAsync} onDelete={deletePost.mutateAsync} visible={endOfNewFeed} />

    <Link to={"/new-post"} className="sticky self-end right-0 bottom-5 rounded-full border-2 border-purple-200 p-2.5 bg-gray-900 opacity-85">
      <VectorPen className="h-6 w-6" />
    </Link>
  </div>)
};

function Home() {
  const { profile } = useAuth();

  return (<Container>
    {profile ? <AuthenticatedView /> : <UnauthView />}
  </Container>)
}