import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { post } from "./post";
import { profile } from "./profile";

export const likedPost = pgTable("liked_post", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => post.id).notNull(),
  profileId: integer("profile_id").references(() => profile.id).notNull()
});