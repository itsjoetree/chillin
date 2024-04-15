import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { post } from "./post";
import { profile } from "./profile";

export const likedPost = pgTable("liked_post", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => post.id, { onDelete: "cascade" }).notNull(),
  profileId: integer("profile_id").references(() => profile.id, { onDelete: "cascade" }).notNull()
}, (t) => ({
  uniqueLikedPost: unique().on(t.postId, t.profileId)
}));