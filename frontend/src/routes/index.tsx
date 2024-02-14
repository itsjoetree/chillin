import { FeedCard } from "@/components/FeedCard";
import { useAuth } from "@/hooks/useAuth";
import { clientApi, getHeaders } from "@/main";
import { EnvelopeSlashFill, VectorPen } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { DisplayMessage } from "@/components/DisplayMessage";
import { SignIn } from "../sections/auth/SignIn";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { CenteredLoading } from "@/components/Loading";
import { useDeletePostMutation } from "@/sections/post/useDeletePostMutation";
import { useLikePostMutation } from "@/sections/post/useLikePostMutation";

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

const AuthenticatedView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("post");
  const { profile } = useAuth();
  const deletePost = useDeletePostMutation();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["post", "feed"],
    queryFn: async ()  => {
      const headers = await getHeaders();
  
      const resp = await clientApi.api.feed.get({
        $headers: headers
      });
  
      return resp.data;
    }
  });

  const likePostMutation = useLikePostMutation();

  // const likePost = useLikePostInListMutation(["post", "feed"]);

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (<div>
    {(posts && Array.isArray(posts) && posts.length > 0) ? posts?.map((post) => (<FeedCard
      key={post.id}
      username={post.author?.username ?? ""}
      avatarUrl=""
      post={post}
      viewerLiked={(
        likePostMutation.isPending && likePostMutation.variables === post.id.toString()) 
          ? !post.likedByViewer : post.likedByViewer
      }
      onLike={async () => await likePostMutation.mutateAsync(post.id.toString())}
      onDelete={post.authorId === profile?.id ? (async () => await deletePost.mutateAsync(post.id.toString())) : undefined}
      onClickComments={() => navigate({
        to: "/posts/$id",
        params: {
          id: post.id.toString()
        }
      })}
    />)) : (<DisplayMessage
      icon={EnvelopeSlashFill}
      title={t("noPostsTitle", { ns: "feed" })}
      body={t("noPostsDescription", { ns: "feed" })}
    />
  )} 
    <Link to={"/new-post"} className="absolute right-2 bottom-5 rounded-full border-2 border-purple-200 p-2.5">
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