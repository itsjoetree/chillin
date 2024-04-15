import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { EmojiSmileFill } from "react-bootstrap-icons";
import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";
import { Link } from "@tanstack/react-router";
import { type Profile } from "server/schema/profile";

type UsernameAvatarProps = ComponentPropsWithoutRef<"div"> & Pick<Profile, "avatarUrl" | "username">;

/**
 * Renders container with username and avatar, used in comments and posts
 */
const UsernameAvatar = ({ username, avatarUrl, className, ...props }: UsernameAvatarProps) => {

  return (<div {...props} className={twMerge("flex gap-2 items-center", className)}>
    <Link to="/$username" params={{ username: username! }}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl!} />
        <AvatarFallback>
          <EmojiSmileFill className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
    </Link>
    
    <Link to="/$username" params={{ username: username! }} className="text-sm">
      <span>{username}</span>
    </Link>
  </div>)
};

export { UsernameAvatar };