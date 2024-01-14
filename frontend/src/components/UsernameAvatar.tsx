import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { EmojiSmileFill } from "react-bootstrap-icons";
import { User } from "../../../server/models/User";
import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type UsernameAvatarProps = ComponentPropsWithoutRef<"div"> & Pick<User, "avatarUrl" | "username">

/**
 * Renders container with username and avatar, used in comments and posts
 */
const UsernameAvatar = ({ username, avatarUrl, className, ...props }: UsernameAvatarProps) => {

  return (<div {...props} className={twMerge("flex gap-2 items-center", className)}>
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>
        <EmojiSmileFill />
      </AvatarFallback>
    </Avatar>

    <span className="text-xs">{username}</span>
  </div>)
};

export { UsernameAvatar };