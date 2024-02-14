import { SignUpRequest } from "./signUpRequest";
import { z } from "zod";
export type SignInRequest = Pick<SignUpRequest, "email" | "password">;

export const formSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8),
});