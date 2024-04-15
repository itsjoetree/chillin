import { HouseFill, PersonCircle } from "react-bootstrap-icons";
import { Logo } from "../components/Logo";
import { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

/**
 * Layout of the application
 */
const AppLayout = ({ children }: PropsWithChildren) => {
  const { profile } = useAuth();

  return (<div className="flex flex-col">
    {/* TODO: Desktop Nav Bar */}
    {/* <div className="desktop-sidebar bg-gray-800 min-h-dvh w-60">
      <div className="sticky flex items-center justify-center top-5">
        <Logo />
      </div>
    </div> */}

    <div className="z-10 flex top-0 bg-gray-800 items-center justify-between p-2 mobile-sidebar w-full">
      <Logo />

      <div className="flex gap-4">
        <Link to="/">
          <HouseFill className="w-6 h-6" />
        </Link>

        <Link to="/$username" params={{ username: profile?.username ?? "" }}>
          <PersonCircle className="w-6 h-6" />
        </Link>
      </div>
    </div>

    <div className="flex flex-col justify-center items-center flex-1 bg-gray-900 min-w-0 overflow-y-clip">
      <main className="flex flex-col max-w-4xl w-full">
        {children}
      </main>
    </div>
  </div>)
};

export default AppLayout;