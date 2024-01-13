import { Avatar, AvatarFallback, AvatarImage } from "../../components/Avatar";
import { Comment } from "../../../../server/models/Comment";
import { useState } from "react";
import { EmojiSmileFill } from "react-bootstrap-icons";
import { ActionButtons } from "../../components/ActionButtons";

/**
 * Main view for a post
 */
const View = () => {
  const [liked, setLiked] = useState(false);
  const comments: Comment[] = 
      Array.from({ length: 35 }, (_, i): Comment => ({
        id: i.toString(),
        authorId: i.toString(),
        username: "username",
        content: "Once upon a time there was a dev who was craving some tiramisu",
        dateCreated: "",
      }));

  return (<>
    <div className="flex flex-col gap-4 text-white py-5 px-2 border-b border-b-purple-200">
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage />
          <AvatarFallback>
            <EmojiSmileFill />
          </AvatarFallback>
        </Avatar>

        <span className="truncate">username</span>
      </div>

      <div className="px-1 flex flex-col gap-3">
        <span>Once upon a time there was a dev who was craving some tiramisu</span>

        <ActionButtons
          className="self-center md:self-start"
          onClickComments={() => console.log("clicked comments")}
          onLike={() => setLiked(!liked)}
          liked={liked}
          likeCount={20}
          commentsCount={5}
        />
      </div>
    </div>

    <div className="relative">
      <div className="absolute h-full w-[0.5px] left-6 bg-purple-50 opacity-20"></div>

      {comments ? comments.map((comment) => (<div key={comment.id} className="px-2 py-5 flex gap-2 flex-col border-b-purple-200 border-b">
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <EmojiSmileFill />
            </AvatarFallback>
          </Avatar>

          <span className="text-xs">{comment.username}</span>
        </div>
        <div className="text-sm pl-10 pr-2">{comment.content}</div></div>)) : <div className="px-2 py-5">No comments found</div>}
    </div>
  </>)
}

export { View };