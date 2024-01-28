import { date, integer, pgTable, serial } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { comment } from "./comment";

export const likedComment = pgTable("liked_comment", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comment.id, { onDelete: "cascade" }).notNull(),
  profileId: integer("profile_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  updatedAt: date("updated_at")
});