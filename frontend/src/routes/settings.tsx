import { Container } from "@/components/Container";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "@/sections/auth/Settings";
import { Link, Outlet, createFileRoute, redirect, useMatchRoute } from '@tanstack/react-router'
import { ArrowLeftCircleFill } from "react-bootstrap-icons";

export const Route = createFileRoute("/settings")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.profile) {
      throw redirect({
        to: "/"
      })
    }
  },
  component: SettingsRoute,
});

function SettingsRoute() {
  const { profile } = useAuth();
  const matchRoute = useMatchRoute();
  const isRoot = matchRoute({ to: "/settings" });

  return (<Container>
    <div className="flex flex-col gap-4">
      <div className="min-h-56">
        {isRoot ? <Settings /> : <Outlet />}
      </div>

      {isRoot ? (
        <Link to="/$username" params={{ username: profile?.username ?? "" }}>
          <ArrowLeftCircleFill className="h-5 w-5" />
        </Link>
      ) : (
        <Link to="/settings">
          <ArrowLeftCircleFill className="h-5 w-5" />
        </Link>
      )}
    </div>
  </Container>)
}