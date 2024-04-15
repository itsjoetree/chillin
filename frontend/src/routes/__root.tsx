import { Outlet, rootRouteWithContext } from "@tanstack/react-router";
import { type AuthContextType } from "@/utils/Auth";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";

type RouterContext = {
  auth: AuthContextType;
}

export const Route = rootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { profile} = useAuth();

  if (profile) {
    return (<AppLayout>
      <Outlet />
    </AppLayout>);
  }

  return (<Outlet />);
}