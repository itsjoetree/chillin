import { date, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { comment } from "./comment";

export const replyComment = pgTable("reply_comments", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comment.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => profile.id).notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  dateCreated: date("date_created"),
  updatedAt: date("updated_at")
});