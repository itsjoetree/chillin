import { date, integer, pgTable, serial } from "drizzle-orm/pg-core";
import { profile } from "./profile";

export const followRelationship = pgTable("follow_relationships", {
  id: serial("id").primaryKey(),
  followeeId: integer("followee_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  followerId: integer("follower_id").references(() => profile.id, { onDelete: "cascade" }).notNull(),
  updatedAt: date("updated_at")
});