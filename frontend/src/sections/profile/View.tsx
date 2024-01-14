import { EmojiSmileFill } from "react-bootstrap-icons";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/Avatar";
import { type Post } from "../../../../server/models/Post";
import { FeedCard } from "../../components/FeedCard";

const View = () => {
  const posts: Post[] = Array.from({ length: 10 }, (_, i): Post => ({
    id: i.toString(),
    authorId: i.toString(),
    likes: 10,
    text: "Once upon a time there was a dev who was craving some tiramisu",
    dateCreated: "",
  }));

  return (<div className="flex flex-col gap-4 py-5 px-2">

    <div className="flex gap-2 items-center">
      <Avatar className="h-14 w-14">
        <AvatarImage />
        <AvatarFallback>
          <EmojiSmileFill className="text-2xl" />
        </AvatarFallback>
      </Avatar>

      <span>username</span>
    </div>

    <div className="px-1 flex flex-col gap-4">
      <div>
        oh hey there how are you?
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1">
          <span className="text-xs">10</span>
          <span className="text-xs font-bold">followers</span>
        </div>

        <div className="flex gap-1">
          <span className="text-xs">10</span>
          <span className="text-xs font-bold">following</span>
        </div>
      </div>
    </div>

    {
      posts.map((post) => (<FeedCard
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