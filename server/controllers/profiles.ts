import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Profile, ProfileView, profile, profileSchema } from "../schema/profile";
import { count, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { followRelationship } from "../schema/followRelationship";
import { alias } from "drizzle-orm/pg-core";

export const profiles = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/profile" })
  .put("", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const body = profileSchema.parse(JSON.parse(String(req.body)));

    // Limit ease of changing for now
    delete body.birthday;

    await db.update(profile)
      .set(body)
      .where(eq(profile.userId, currentProfile.userId!));

    return await getProfile(db, supabase, req.headers);  
  })
  .get("/:username", async (req): Promise<ProfileView> => {
    const username = req.params.username;

    if (!username)
      throw new Error("username is required");

    const followers = alias(followRelationship, "followers");
    const following = alias(followRelationship, "following");

    const result = await db
      .select({
        avatarUrl: profile.avatarUrl,
        username: profile.username,
        nickname: profile.nickname,
        birthday: profile.birthday,
        updatedAt: profile.updatedAt,
        siteVariant: profile.siteVariant,
        role: profile.role,
        bio: profile.bio,
        followerCount: count(followers.id),
        followingCount: count(following.id)
      })
      .from(profile)
      .leftJoin(followers, eq(followers.followeeId, profile.id))
      .leftJoin(following, eq(following.followerId, profile.id))
      .where(eq(profile.username, String(username)))
      .groupBy(profile.id);

    return result[0];
  })
  .get("", async (req): Promise<Profile> => {
    return await getProfile(db, supabase, req.headers);
  })