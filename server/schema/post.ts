import { z } from "zod";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const post = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  text: varchar("text", { length: 1000 }).notNull(),
  dateCreated: timestamp("date_created").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Post = InferSelectModel<typeof post> & {
  likes: number;
  commentCount: number;
  likedByViewer?: boolean;
  author?: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
};

export type PostRequestBody = Omit<InferInsertModel<typeof post>, "authorId">;

export const postSchema = z.object({
  text: z.string().max(1000),
  seen: z.boolean().optional()
});