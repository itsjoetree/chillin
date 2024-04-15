import { ArrowLeftCircleFill, ImageFill, Trash3Fill } from "react-bootstrap-icons";
import { UsernameAvatar } from "./UsernameAvatar";
import { SelectedImage } from "../types";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Card } from "./Card";
import { useTranslation } from "react-i18next";
import { Profile } from "server/schema/profile";

export type PostEditorProps = Pick<Profile, "username" | "avatarUrl"> & {
  /**
   * Ref to the Textarea component
   */
  ref?: React.Ref<HTMLTextAreaElement>;
  disableSubmit?: boolean;
  onClose: () => void;
  onInputUpdate?: (text: string) => void;
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
const PostEditor = ({ username, avatarUrl, onClose, onInputUpdate, disableSubmit, ...props }: PostEditorProps) => {
  const { t } = useTranslation("post");
  const showImageEditor = "selectedImages" in props && "setImages" in props;

  return (<div className="flex flex-col gap-4 pb-2">
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
          onInput={(e) => onInputUpdate?.(e.currentTarget.value)}
          autoFocus
          placeholder={t`newPlaceholder`}
          className="resize-none"
          rows={5}
        />

        <Button disabled={disableSubmit} type="submit" className="md:self-start">{t`post`}</Button>
      </div>
    </div>

    <button onClick={onClose} className="pl-1.5">
      <ArrowLeftCircleFill className="h-5 w-5" />
    </button>

    {(showImageEditor && (props.selectedImages?.length ?? 0) > 0) && <div className="flex flex-col gap-4 pl-14 pr-2">
      <h2 className="text-xl font-semibold">{t`selectedMedia`}</h2>
      <div className="flex flex-wrap items-center gap-4">
        {
          props.selectedImages?.map(image => (<Card className="w-full h-full flex items-center relative md:w-44 md:h-64" key={image.id}>
            <button onClick={() => props.setImages(props.selectedImages.filter(i => i.id !== image.id))} title={t`remove`} className="absolute top-2 right-2">
              <Trash3Fill className="h-4 w-4" />
            </button>
            <img className="max-h-full w-full" src={image.preview} alt={t`uploadedImage`} />
          </Card>))
        }
      </div>
    </div>}
  </div>)
}

PostEditor.displayName = "PostEditor";

export { PostEditor }