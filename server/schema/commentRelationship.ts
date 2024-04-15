import { integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { comment } from "./comment";

export const commentRelationship = pgTable("comment_relationships", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => comment.id, { onDelete: "cascade" }).notNull(),
  childId: integer("child_id").references(() => comment.id, { onDelete: "cascade" }).notNull(),
  dateCreated: timestamp("date_created").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  uniqueCommentRelationship: unique().on(t.parentId, t.childId)
}));