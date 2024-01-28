import { z } from "zod";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text, date, uuid, pgEnum } from "drizzle-orm/pg-core";

export const siteVariantEnum = pgEnum("site_variant", ["chillin", "charismatic", "grounded", "cool"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const profile = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  username: text("username"),
  nickname: text("nickname"),
  birthday: date("birthday"),
  updatedAt: date("updated_at"),
  siteVariant: siteVariantEnum("site_variant").default("chillin").notNull(),
  role: roleEnum("role").default("user").notNull()
});

export const profileSchema = z.object({
  username: z.string().min(3).max(32).refine(value => !value.includes(" ")),
  nickname: z.string().max(32).optional(),
  birthday: z.string().refine(value => !isNaN(Date.parse(value))).optional(),
  siteVariant: z.enum(["chillin", "charismatic", "grounded", "cool"]).default("chillin"),
});

export type Profile = InferSelectModel<typeof profile>;
export type ProfileView = Omit<InferSelectModel<typeof profile>, "userId" | "id"> & { followerCount: number, followingCount: number };
export type ProfileRequestBody = Omit<InferInsertModel<typeof profile>, "id" | "userId" | "updatedAt" | "role" | "email" | "avatarUrl">;