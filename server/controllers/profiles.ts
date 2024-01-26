import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Profile, profile, profileSchema } from "../schema/profile";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";

export const profiles = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/profile" })
  .put("", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const body = profileSchema.parse(JSON.parse(String(req.body)));

    await db.update(profile)
      .set(body)
      .where(eq(profile.userId, currentProfile.userId!));

    return await getProfile(db, supabase, req.headers);  
  })
  .get("", async (req): Promise<Profile> => {
    return await getProfile(db, supabase, req.headers);
  })