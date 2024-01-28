import { createElement } from "react";
import { Icon } from "react-bootstrap-icons";

type DisplayMessageProps = {
  icon: Icon;
  title: string;
  body: string;
};

export const DisplayMessage = ({ icon, title, body }: DisplayMessageProps) => (
  <div className="flex flex-col gap-2 items-center justify-center">
    <div className="flex flex-col gap-1 items-center justify-center">

      <div className="flex items-center justify-center rounded-full border-purple-200 border-4 p-5 animate-pulse">
        {
          createElement(icon, { className: "h-10 w-10 z-10" })
        }
      </div>

      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    <div>{body}</div>
  </div>
);