import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { profile } from "../schema/profile";
import { followRelationship } from "../schema/followRelationship";
import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { alias } from "drizzle-orm/pg-core";

export const users = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/user" })
  .get("/:username/follows/:targetUsername", async (req): Promise<boolean> => {
    const { username, targetUsername } = req.params;

    if (!username || !targetUsername)
      throw new Error("username and targetUsername are required");
    
    const followee = alias(profile, "followee");
    const follower = alias(profile, "follower");

    const result = await db
      .select()
      .from(followRelationship)
      .leftJoin(followee, eq(followee.id, followRelationship.followeeId))
      .leftJoin(follower, eq(follower.id, followRelationship.followerId))
      .where(
        and(
          eq(followee.username, targetUsername),
          eq(follower.username, username)
        )
      );

    return !!result[0];
  })
  .post("/:username/follow", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const followeeUsername = req.params.username;

    if (!followeeUsername)
      throw new Error("followee is required");

    const followee = await db
      .select()
      .from(profile)
      .where(eq(profile.username, String(followeeUsername)));

    await db.insert(followRelationship).values({
      followerId: currentProfile.id,
      followeeId: followee[0].id
    });
  })
  .delete("/:username/unfollow", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const followeeUsername = req.params.username;

    if (!followeeUsername)
    throw new Error("followee is required");

    const followee = await db
      .select()
      .from(profile)
      .where(eq(profile.username, String(followeeUsername)));

    const relationship = await db
      .select()
      .from(followRelationship)
      .where(and(eq(followRelationship.followerId, currentProfile.id),
        eq(followRelationship.followeeId, followee[0].id)));

    await db.delete(followRelationship).where(eq(followRelationship.id, relationship[0].id));
  })