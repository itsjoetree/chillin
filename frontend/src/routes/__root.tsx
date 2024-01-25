import { useAuth } from "@/hooks/useAuth";
import { Outlet, RootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { EmojiHeartEyesFill } from "react-bootstrap-icons";
import AppLayout from "@/layouts/AppLayout";

const RootComponent = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (<div className="min-h-dvh flex justify-center items-center">
      <EmojiHeartEyesFill className="animate-pulse h-10 w-10" />
    </div>);
  }

  if (profile) {
    return (<AppLayout>
      <Outlet />
    </AppLayout>);
  }

  return (<Outlet />);
};

export const Route = new RootRoute({
  component: () => <>
    <RootComponent />
    <TanStackRouterDevtools />
  </>,
})