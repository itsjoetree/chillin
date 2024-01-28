import { FeedCard } from "@/components/FeedCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { clientApi, getHeaders } from "@/main";
import { EnvelopeSlashFill, VectorPen } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Link, createFileRoute } from '@tanstack/react-router'
import { DisplayMessage } from "@/components/DisplayMessage";
import { SignIn } from "../sections/auth/SignIn";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { CenteredLoading } from "@/components/Loading";

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
  const { t } = useTranslation("post");
  const { toast } = useToast();
  const { data: posts, isLoading } = useQuery("home-feed", async ()  => {
    const headers = await getHeaders();

    const resp = await clientApi.api.feed.get({
      $headers: headers
    });

    return resp.data;
  });

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (<div>
    {(posts && Array.isArray(posts) && posts.length > 0) ? posts?.map((post) => (<FeedCard
      key={post.id}
      onDelete={() => toast({
        title: t("deletedTitle", { ns: "post" }),
        description: t("deletedDescription", { ns: "post" })
      })}
      username="username"
      avatarUrl=""
      post={post}
      onLike={() => console.log("liked post")}
      onClickComments={() => console.log("clicked comments")}
    />)) : (<DisplayMessage
      icon={EnvelopeSlashFill}
      title={t("noPostsTitle", { ns: "feed" })}
      body={t("noPostsDescription", { ns: "feed" })}
    />
  )} 
    <Link to={"/new-post"} className="absolute right-2 bottom-5 rounded-full border-2 border-purple-200 p-2">
      <VectorPen className="h-5 w-5" />
    </Link>
  </div>)
};

function Home() {
  const { profile } = useAuth();

  return (<Container>
    {profile ? <AuthenticatedView /> : <UnauthView />}
  </Container>)
}