import { z } from "zod";
import { boolean, date, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { type Comment } from "../schema/comment";

export const post = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  text: varchar("text", { length: 1000 }).notNull(),
  dateCreated: timestamp("date_created").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  seen: boolean("seen").default(false)
});

export type Post = InferSelectModel<typeof post> & { likes: number; commentCount: number; comments?: Comment[]; likedByViewer?: boolean };
export type PostRequestBody = Omit<InferInsertModel<typeof post>, "authorId">;

export const postSchema = z.object({
  text: z.string().max(1000),
  seen: z.boolean().optional()
});