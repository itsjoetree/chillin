import { ProfileUpdate } from "@/sections/auth/ProfileUpdate";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/settings/update-profile")({
  component: UpdateProfileRoute,
});

function UpdateProfileRoute() {
  return <ProfileUpdate />
}