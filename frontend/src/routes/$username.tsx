import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { clientApi, getHeaders } from "@/main";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { EmojiDizzyFill, EmojiSmileFill, GearFill, QuestionCircleFill, YinYang } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/Dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { CenteredLoading } from "@/components/Loading";
import { DisplayMessage } from "@/components/DisplayMessage";
import { Container } from "@/components/Container";
import { FeedCard } from "@/components/FeedCard";
import { Post } from "server/schema/post";

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
  const { toast } = useToast();

  const { data: isFollowing } = useQuery(["follows", username, targetUsername], async () => {
    try {
      const headers = await getHeaders();
      const result = await clientApi.api.user[username].follows[targetUsername].get({
        $headers: headers
      });

      return !!result.data;
    } catch (err) {
      return false;
    }
  }, {
    enabled: username !== targetUsername
  });

  const toggleFollowMutation = useMutation(async () => {
    if (isFollowing) {
      try {
        const headers = await getHeaders();
        await clientApi.api.user[targetUsername].unfollow.delete({
          $headers: headers
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to unfollow user",
        });
      }
    } else {
      const headers = await getHeaders();
      await clientApi.api.user[targetUsername].follow.post({
        $headers: headers
      });
    }
  })

  const onToggleFollow = async () => {
    await toggleFollowMutation.mutateAsync();
  }

  return {
    isFollowing,
    isSubmitting: toggleFollowMutation.isLoading,
    onToggleFollow
  };
}

function ProfileRoute() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("profile");
  const { toast } = useToast();
  const { profile } = useAuth();
  const { username } = Route.useParams();
  const { isFollowing, isSubmitting, onToggleFollow } = useFollow(profile?.username ?? "", username);

  const { data: profileInView, isLoading } = useQuery(["profile", username], async () => {
    const resp = await clientApi.api.profile[username].get();
    return resp.data;
  });

  const { data: posts, isLoading: loadingPosts } = useQuery(["posts", username], async () => {
    // TODO: Infinite scroll
    const resp = await clientApi.api.post.get({
      $headers: await getHeaders(),
      $query: {
        username
      }
    });
    return resp.data;
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const headers = await getHeaders();

      const previousPosts = queryClient.getQueryData<Post[]>(["posts", username])
      const likedPost = previousPosts?.find((post) => post.id === Number(postId));

      let resp: Record<string, unknown> = {};

      if (!likedPost?.likedByViewer) {
        resp = await clientApi.api.post[postId].unlike.delete({
          $headers: headers
        });
      } else {
        resp = await clientApi.api.post[postId].like.post({
          $headers: headers
        });
      }

      if (resp.error) {
        throw new Error();
      }
    },
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["posts", username] })
  
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", username])
  
      // Optimistically update to the new value
      queryClient.setQueryData<Post[]>(["posts", username], (old) => {
        if (!old) return [];

        const optimisticData = structuredClone(old.find((post) => post.id === Number(postId)));

        if (optimisticData) {
          optimisticData.likedByViewer = !optimisticData?.likedByViewer;
          optimisticData.likes += optimisticData.likedByViewer ? 1 : -1;
        }

        return old.map(oldPost => (oldPost.id === Number(postId) && optimisticData)
          ? optimisticData
          : oldPost);
      });

      return { previousPosts }
    },
    onError: (err, like, context) => {
      toast({
        title: t("likeFailure", { ns: "post" }),
        description: t("likeFailureDescription", { ns: "post" }),
      });

      queryClient.setQueryData(["posts", username], context?.previousPosts)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", username] })
    },
  })

  const deletePost = async (postId: string) => {
    const headers = await getHeaders();

    const resp = await clientApi.api.post[postId].delete({
      $headers: headers
    });

    if (resp.error) {
      toast({
        title: t("deleteFailureTitle", { ns: "post" }),
        description: t("deleteFailure", { ns: "post" }),
      });

      return;
    }

    toast({
      title: t("deletedTitle", { ns: "post" }),
      description: t("deletedDescription", { ns: "post" }),
    });

    queryClient.invalidateQueries(["posts", profile?.username]);
  }

  const likePost = async (postId: string) => await likeMutation.mutateAsync(postId);

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
      <div className="flex max-sm:justify-between items-center md:gap-4">
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
          className="block justify-self-end">
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
      loadingPosts ? <CenteredLoading /> : (Array.isArray(posts) && posts?.length) ? posts.map((post) => (<FeedCard
        key={post.id}
        username={profileInView.username}
        avatarUrl={profileInView.avatarUrl}
        post={post}
        viewerLiked={post.likedByViewer}
        onDelete={profile?.username === profileInView.username ? (() => deletePost(post.id.toString())) : undefined}
        onLike={() => likePost(post.id.toString())}
        onClickComments={() => console.log("clicked comments")}
      />)) : <DisplayMessage
        icon={EmojiDizzyFill}
        title={t`noPostsTitle`}
        body={t`noPostsDescription`}
      />
    }
  </div>);
}