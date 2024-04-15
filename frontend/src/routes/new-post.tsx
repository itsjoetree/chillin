import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Container } from "@/components/Container";
import { NewPost } from "@/sections/post/NewPost";

export const Route = createFileRoute("/new-post")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.profile) {
      throw redirect({
        to: "/"
      })
    }
  },
  component: NewPostRoute,
});

function NewPostRoute() {
  const navigate = useNavigate();

  return (
    <Container>
      <NewPost onClose={() => navigate({
        to: "/"
      })} />
    </Container>
  );
}