import { FeedCard } from "@/components/FeedCard";
import { useToast } from "@/hooks/useToast";
import { createElement } from "react";
import { EnvelopeSlashFill, Icon } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { type Post } from "server/schema/post";

type DisplayMessageProps = {
  icon: Icon;
  title: string;
  body: string;
}

const DisplayMessage = ({ icon, title, body }: DisplayMessageProps) => (<div className="flex flex-col gap-2 items-center justify-center">
  <div className="flex flex-col gap-1 items-center justify-center">
    {
      createElement(icon, { className: "h-10 w-10" })
    }
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
  <div>{body}</div>
</div>);

const Body = () => {
  const { toast } = useToast();
  const { t } = useTranslation("post");

  const { data: posts, isLoading } = useQuery("home-feed", async (): Promise<Post[]>  => {
    return [];
  });

  if (isLoading) {
    return <div className="p-2">Loading...</div>;
  }

  if (posts?.length === 0) {
    return (
      <DisplayMessage
        icon={EnvelopeSlashFill}
        title="Nothing new!"
        body="No new posts to show, try following some more people!"
      />
    );
  }

  return posts?.map((post) => (<FeedCard
    onDelete={() => toast({
      title: t("deletedTitle", { ns: "post" }),
      description: t("deletedDescription", { ns: "post" })
    })}
    username="username"
    avatarUrl=""
    commentsCount={5}
    key={post.id}
    post={post}
    onLike={() => console.log("liked post")}
    onClickComments={() => console.log("clicked comments")}
  />));
  
};

export const component = function Index() {
  return (
    <div className="py-5">
      <Body />
    </div>
  )
}