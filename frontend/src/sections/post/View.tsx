import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { Comment } from "server/models/Comment";
import { useRef, useState } from "react";
import { EmojiSmileFill } from "react-bootstrap-icons";
import { ActionButtons } from "@/components/ActionButtons";
import { UsernameAvatar } from "@/components/UsernameAvatar";
import { PostEditor } from "@/components/PostEditor";
import { SelectedImage } from "@/types";
import { useToast } from "@/hooks/useToast";
import { Trans } from "react-i18next";

/**
 * Main view for a post
 */
const View = () => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const comments: Comment[] = 
      Array.from({ length: 35 }, (_, i): Comment => ({
        id: i.toString(),
        authorId: i.toString(),
        username: "username",
        content: "Once upon a time there was a dev who was craving some tiramisu",
        dateCreated: "",
      }));

  const onToggleComment = (toggle: boolean) => {
    if (!toggle && images?.length > 0) {
      for (const image of images) {
        URL.revokeObjectURL(image.preview);
      }

      setImages([]);
    } 

    setShowAddComment(toggle);
  }

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
          commentsWrapper={<button onClick={() => onToggleComment(!showAddComment)} />}
          className="self-center md:self-start"
          onLike={() => setLiked(!liked)}
          liked={liked}
          likeCount={20}
          commentsCount={5}
        />
      </div>
    </div>

    <div className="relative">
      <div className="absolute h-full w-[0.5px] left-6 bg-purple-50 opacity-20"></div>

      {showAddComment && <PostEditor
        ref={contentRef}
        selectedImages={images}
        setImages={setImages}
        username="itsjoetree"
        avatarUrl="https://github.com/shadcn.png"
        onClose={() => onToggleComment(false)}
        onPost={() => toast({
          title: "Comment Posted",
          description: contentRef.current?.value ?? "",
        })}
      />}

      <div className={showAddComment ? "hidden" : undefined}>
        {comments ? comments.map((comment) => (<div key={comment.id} className="px-2 py-5 flex gap-2 flex-col border-b-purple-200 border-b">
          <UsernameAvatar username={comment.username} avatarUrl="https://github.com/shadcn.png" />
          <div className="text-sm pl-10 pr-2">{comment.content}</div></div>)) : (<div className="px-2 py-5">
            <Trans ns="post" i18nKey="noComments" />
          </div>)}
      </div>
    </div>
  </>)
}

export { View };