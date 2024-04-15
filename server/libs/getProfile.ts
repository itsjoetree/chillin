import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Profile, profile } from "../schema/profile";
import { eq } from "drizzle-orm";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Obtains profile by looking at user's token
 */
export const getProfile = async (db: PostgresJsDatabase, supabase: SupabaseClient, headers: Record<string, string | undefined>): Promise<Profile> => {
  const token = headers["authorization"]?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) throw new Error("Unauthorized");

  const currentProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, data.user.id));

  return currentProfile[0];
}