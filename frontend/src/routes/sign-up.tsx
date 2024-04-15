import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { SignUp } from "@/sections/auth/SignUp";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async ({ context }) => {
    if (context.auth.profile) {
      throw redirect({
        to: "/"
      })
    }
  },
  component: SignUpRoute,
});

function SignUpRoute() {

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Logo size="lg" />
          <SignUp />
        </div>
      </div>
    </Container>
  );
}