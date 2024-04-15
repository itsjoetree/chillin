import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi, getHeaders } from "@/main";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { EmojiDizzyFill, EmojiSmileFill, GearFill, QuestionCircleFill, YinYang } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/Dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { CenteredLoading } from "@/components/Loading";
import { DisplayMessage } from "@/components/DisplayMessage";
import { Container } from "@/components/Container";
import { getPostOnProfileQueryKey } from "@/utils/QueryKeys";
import { useLikeFeedPost } from "@/mutations/useLikeFeedPost";
import { FeedCard } from "@/components/FeedCard";
import { useDeletePostMutation } from "@/sections/post/useDeletePostMutation";

export const Route = createFileRoute("/$username")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.profile) {
      throw redirect({
        to: "/"
      })
    }
  },
  component: ProfileRoute,
});

const useFollow = (username: string, targetUsername: string) => {
  const queryClient = useQueryClient();

  const { data: isFollowing } = useQuery({
    queryKey: ["follows", username, targetUsername],
    queryFn: async () => {
      const result = await clientApi.api.user[username].follows[targetUsername].get({
        $headers: await getHeaders()
      });

      if (result.error) throw Error();


      return !!result.data;
    },
    enabled: username !== targetUsername
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      const headers = await getHeaders();

      if (isFollowing) {
        await clientApi.api.user[targetUsername].unfollow.delete({
          $headers: headers
        });
      } else {
        await clientApi.api.user[targetUsername].follow.post({
          $headers: headers
        });
      }

      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["follows", username, targetUsername] });
    }
  });

  const onToggleFollow = async () => {
    await toggleFollowMutation.mutateAsync();
  }

  return {
    isFollowing,
    isSubmitting: toggleFollowMutation.isPending,
    onToggleFollow
  };
}

function ProfileRoute() {
  const navigate = useNavigate();
  const { t } = useTranslation("profile");
  const { profile } = useAuth();
  const { username } = Route.useParams();
  const { isFollowing, isSubmitting, onToggleFollow } = useFollow(profile?.username ?? "", username);

  const { data: profileInView, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const resp = await clientApi.api.profile[username].get();
      return resp.data;
    }
  });

  const deletePost = useDeletePostMutation();
  const likePost = useLikeFeedPost(getPostOnProfileQueryKey(username));

  const {
    data: posts,
    isLoading: loadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: getPostOnProfileQueryKey(username),
    queryFn: async ({ pageParam })  => {
      const headers = await getHeaders();
  
      const resp = await clientApi.api.feed.get({
        $headers: headers,
        $query: {
          ...(pageParam ? { cursor: pageParam.toString() } : {}),
          username
        } 
      });
  
      return resp.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as number | undefined,
  });

  if (isLoading) return <CenteredLoading />;

  if (!profileInView) return (<Container>
    <DisplayMessage
      icon={QuestionCircleFill}
      title="User not found!"
      body="The user you are looking for does not exist"
    />
  </Container>);

  return (<div className="flex flex-col gap-6 py-5 px-2">
    <div className="flex flex-col gap-4">
      <div className="flex max-sm:justify-between items-center gap-4">
        <div className="flex gap-2 items-center">
          <Avatar className="h-14 w-14">
            <AvatarImage />
            <AvatarFallback>
              <EmojiSmileFill className="text-2xl" />
            </AvatarFallback>
          </Avatar>

          <span className="truncate">{profileInView.username}</span>

          {profileInView.role === "admin" && <Dialog>
            <DialogTrigger title="Admin" className="cursor-pointer"><YinYang /></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t`admin`}</DialogTitle>
                <DialogDescription className="flex flex-col gap-4 justify-center items-center text-white">
                  <YinYang className="h-5 w-5" />
                  {t`adminDescription`}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>}
        </div>

        {profile?.username !== profileInView.username ? <Button
          disabled={isSubmitting}
          onClick={onToggleFollow}
          variant={isFollowing ? "secondary" : "default"}
          className="transition-all duration-500 block justify-self-end">
          {isFollowing ? t`following` : t`follow`}
        </Button> : <Link to="/settings">
          <GearFill className="h-5 w-5" />
        </Link>}
      </div>

      <div className="px-1 flex flex-col gap-4">
        {profileInView?.nickname && <div className="font-semibold font-lg">
          {profileInView.nickname}
        </div>}

        {profileInView?.bio && <div>
          {profileInView.bio}
        </div>}

        <div className="flex gap-2">
          <div className="flex gap-1">
            <span className="text-xs">{profileInView.followerCount}</span>
            <span className="text-xs font-bold">
              {t`followers`}
            </span>
          </div>

          <div className="flex gap-1">
            <span className="text-xs">{profileInView.followingCount}</span>
            <span className="text-xs font-bold">
              {t`following`}
            </span>
          </div>
        </div>
      </div>
    </div>

    {
      loadingPosts ? <CenteredLoading /> : (posts?.pages?.length) ? posts?.pages?.map((page) => page?.items?.map(pi => 
        <FeedCard
          key={pi.id}
          username={pi?.author?.username ?? ""}
          avatarUrl={pi?.author?.avatarUrl ?? null}
          post={pi}
          viewerLiked={pi?.likedByViewer}
          onDelete={profile?.username === pi?.author?.username ? (async () => await deletePost.mutateAsync(pi.id?.toString())) : undefined}
          onLike={async () => await likePost.mutateAsync({ postId: pi?.id, operation: pi?.likedByViewer ? "unlike" : "like" })}
          onClickComments={() => navigate({
            to: "/posts/$id",
            params: {
              id: pi?.id.toString()
            }
          })}
        />
      )) : <DisplayMessage
        icon={EmojiDizzyFill}
        title={t`noPostsTitle`}
        body={t`noPostsDescription`}
      />
    }

    {(hasNextPage && !isFetchingNextPage) && <button
      onClick={() => fetchNextPage()}
      className="text-purple-200">Load More...</button>}

    {isFetchingNextPage && <CenteredLoading />}
  </div>);
}