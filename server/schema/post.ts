import { z } from "zod";
import { boolean, date, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const post = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => profile.id).notNull(),
  text: varchar("text", { length: 1000 }).notNull(),
  dateCreated: date("date_created"),
  updatedAt: date("updated_at"),
  seen: boolean("seen").default(false)
});

export type Post = InferSelectModel<typeof post> & { likes: number; commentCount: number; };
export type PostBody = InferInsertModel<typeof post>;

export const postSchema = z.object({
  text: z.string().max(1000),
  seen: z.boolean().optional()
});