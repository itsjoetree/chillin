import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Profile, profile, profileSchema } from "../schema/profile";
import { db } from "../src";
import { eq } from "drizzle-orm";

export const profiles = new Elysia({ prefix: "/api/profile" })
  .put("", async (req) => {
    const currentProfile = await getProfile(req.headers);

    const body = profileSchema.parse(JSON.parse(String(req.body)));

    await db.update(profile)
      .set(body)
      .where(eq(profile.userId, currentProfile.userId!));
  })
  .get("", async (req): Promise<Profile> => {
    return await getProfile(req.headers);
  })