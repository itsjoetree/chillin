import { z } from "zod";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { post } from "./post";
import { InferSelectModel } from "drizzle-orm";

export const comment = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => post.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  dateCreated: timestamp("date_created").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const commentSchema = z.object({
  postId: z.number(),
  content: z.string().max(500),
});

export type Comment = InferSelectModel<typeof comment>;
export type CommentRequestBody = Pick<Comment, "content">;