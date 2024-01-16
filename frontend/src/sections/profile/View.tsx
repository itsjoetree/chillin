import { EmojiSmileFill, YinYang } from "react-bootstrap-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { type Post } from "server/models/Post";
import { FeedCard } from "@/components/FeedCard";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/Button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/Dialog";
import { useTranslation } from "react-i18next";

const View = () => {
  const { t } = useTranslation("profile");
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);

  const posts: Post[] = Array.from({ length: 10 }, (_, i): Post => ({
    id: i.toString(),
    authorId: i.toString(),
    likes: 10,
    text: "Once upon a time there was a dev who was craving some tiramisu",
    dateCreated: "",
  }));

  return (<div className="flex flex-col gap-4 py-5 px-2">
    <div className="flex max-sm:justify-between items-center md:gap-4">
      <div className="flex gap-2 items-center">
        <Avatar className="h-14 w-14">
          <AvatarImage />
          <AvatarFallback>
            <EmojiSmileFill className="text-2xl" />
          </AvatarFallback>
        </Avatar>

        <span className="truncate">username</span>

        <Dialog>
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
        </Dialog>
      </div>

      <Button onClick={() => setFollowing(!following)} variant={following ? "secondary" : "default"} className="block justify-self-end">
        {following ? t`following` : t`follow`}
      </Button>
    </div>


    <div className="px-1 flex flex-col gap-4">
      <div>
        oh hey there how are you?
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1">
          <span className="text-xs">10</span>
          <span className="text-xs font-bold">
            {t`followers`}
          </span>
        </div>

        <div className="flex gap-1">
          <span className="text-xs">10</span>
          <span className="text-xs font-bold">
            {t`following`}
          </span>
        </div>
      </div>
    </div>

    {
      posts.map((post) => (<FeedCard
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
      />))
    }
  </div>);
}

export { View };