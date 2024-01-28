import { EmojiHeartEyesFill } from "react-bootstrap-icons";
import { twMerge } from "tailwind-merge";

type LogoProps = {
  size?: "md" | "lg";
};

const Logo = ({ size = "md" }: LogoProps) => (<div className="flex gap-1 items-center self-center text-purple-200">
  <span className={twMerge(
    size === "md" && "text-lg",
    size === "lg" && "text-4xl"
  )}>chillin</span>
  <EmojiHeartEyesFill className={twMerge(
    size === "md" && "text-lg",
    size === "lg" && "text-4xl"
  )} />
</div>);

export { Logo };