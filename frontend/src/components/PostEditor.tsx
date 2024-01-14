import { ArrowLeftCircleFill, ImageFill, Trash3Fill } from "react-bootstrap-icons";
import { User } from "../../../server/models/User";
import { UsernameAvatar } from "./UsernameAvatar";
import { SelectedImage } from "../types";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Card } from "./Card";
import { forwardRef } from "react";

type PostEditorProps = Pick<User, "username" | "avatarUrl"> & {
  /**
   * Ref to the Textarea component
   */
  ref?: React.Ref<HTMLTextAreaElement>;
  onClose: () => void;
  onPost: () => void;
}  & ({
  selectedImages: SelectedImage[];
  setImages: (images: SelectedImage[]) => void;
}| {
  selectedImages?: never;
  setImages?: never;
})

/**
 * Editor for either a new post or a comment
 */
const PostEditor = forwardRef<HTMLTextAreaElement, PostEditorProps>(({ username, avatarUrl, onClose, onPost, ...props }, ref) => {
  const showImageEditor = "selectedImages" in props && "setImages" in props;

  return (<div className="px-2 pt-5 pb-2">
    <UsernameAvatar
      username={username}
      avatarUrl={avatarUrl}
    />

    <div className="flex">
      {showImageEditor && <div className="pt-16 pl-2">
        <label className="cursor-pointer" htmlFor="imageInput">
          <ImageFill className="h-4 w-4" />
        </label>
        <input onChange={(e) => {
          if (!e.target.files) return;

          const newImages: SelectedImage[] = [];

          for (const file of Array.from(e.target.files)) {
            const id = Math.random().toString(36);
            const preview = URL.createObjectURL(file);

            newImages.push({ id, file, preview });
          }

          props.setImages?.([...props.selectedImages, ...newImages])
        }}
          id="imageInput" className="hidden" type="file" accept="image/png, image/jpeg" multiple />
      </div>}

      <div className="flex flex-col w-full gap-4 py-2 pl-8 pr-4">
        <Textarea
          ref={ref}
          autoFocus
          placeholder="What would you like to say?"
          className="resize-none"
          rows={5}
        />

        <Button onClick={onPost} className="md:self-start">Post</Button>
      </div>
    </div>

    <button onClick={onClose} className="pl-1.5">
      <ArrowLeftCircleFill className="h-5 w-5" />
    </button>

    {(showImageEditor && (props.selectedImages?.length ?? 0) > 0) && <div className="flex flex-col gap-4 pl-14 pr-2">
      <h2 className="text-xl font-semibold">Selected Media</h2>
      <div className="flex flex-wrap items-center gap-4">
        {
          props.selectedImages?.map((image, index) => (<Card className="w-full h-full flex items-center relative md:w-44 md:h-64" key={index}>
            <button onClick={() => props.setImages(props.selectedImages.filter(i => i.id !== image.id))} title="Remove" className="absolute top-2 right-2">
              <Trash3Fill className="h-4 w-4" />
            </button>
            <img className="max-h-full w-full" src={image.preview} alt="User uploaded file" />
          </Card>))
        }
      </div>
    </div>}
  </div>)
});

PostEditor.displayName = "PostEditor";

export { PostEditor }