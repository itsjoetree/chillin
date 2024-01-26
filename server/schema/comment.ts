import { z } from "zod";
import { date, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { post } from "./post";
import { InferSelectModel } from "drizzle-orm";

export const comment = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => post.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  dateCreated: date("date_created"),
  updatedAt: date("updated_at")
});

export const commentSchema = z.object({
  postId: z.number(),
  content: z.string().max(500),
});

export type Comment = InferSelectModel<typeof comment>;
export type CommentRequestBody = Pick<Comment, "content">;