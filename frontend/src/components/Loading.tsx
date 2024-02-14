import { useEffect, useState } from "react";
import { EmojiHeartEyesFill } from "react-bootstrap-icons";
import { twJoin } from "tailwind-merge";

export const Loading = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 1250);
  }, []);
 
  return (<EmojiHeartEyesFill className={twJoin("h-10 w-10 opacity-0", show && "animate-pulse")} />)
};

export const CenteredLoading = () => (<div className="flex justify-center items-center">
  <Loading />
</div>);

export const ScreenLoading = () => (<div className="min-h-dvh flex justify-center items-center">
  <Loading />
</div>);
