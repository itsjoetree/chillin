import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const Card = ({ children, className }: ComponentProps<"div">) => (<div className={twMerge(
  "bg-gray-800 border border-purple-200 rounded-xl p-5", className
)}>
  {children}
</div>)

export { Card };