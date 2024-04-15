import { date, integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { post } from "./post";

export const seenPost = pgTable("seen_posts", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => post.id, { onDelete: "cascade" }).notNull(),
  profileId: integer("profile_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  updatedAt: date("updated_at")
}, (t) => ({
  uniqueSeenPost: unique().on(t.postId, t.profileId)
}));