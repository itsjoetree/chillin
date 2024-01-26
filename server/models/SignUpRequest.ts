import { z } from 'zod';

export type SignUpRequest = {
  username: string;
  nickname?: string;
  birthday: string;
  password: string;
  email: string;
  siteVariant: "chillin" | "charismatic" | "grounded" | "cool";
}

// Backend schema
export const formSchema = z.object({
  username: z.string().min(3).max(32).refine(value => !value.includes(" ")),
  nickname: z.string().max(32).optional(),
  birthday: z.string().refine(value => !isNaN(Date.parse(value))),
  password: z.string().min(8),
  email: z.string().email().max(254),
  siteVariant: z.enum(["chillin", "charismatic", "grounded", "cool"]).default("chillin"),
});