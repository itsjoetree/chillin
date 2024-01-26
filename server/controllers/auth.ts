import Elysia from "elysia";
import { formSchema as signInSchema } from "../models/SignInRequest";
import { formSchema as signUpSchema } from "../models/SignUpRequest";
import { AuthToken } from "../models/AuthToken";
import { profile } from "../schema/profile";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";

export const auth = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/auth" })
  .post("/sign-in", async (req): Promise<AuthToken> => {
    const body = signInSchema.parse(JSON.parse(String(req.body)));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    };
  })
  .post("/sign-up", async (req): Promise<AuthToken> => {
    const body = signUpSchema.parse(JSON.parse(String(req.body)));

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          nickname: body.nickname,
          site_variant: body.siteVariant,
          birthday: body.birthday
        }
      }
    });

    if (error || !data?.session || !data?.user)
      throw new Error(error?.message ?? "Unable to sign up");

    await db.update(profile)
      .set({
        username: body.username,
        nickname: body.nickname,
        siteVariant: body.siteVariant,
        birthday: body.birthday
      })
      .where(eq(profile.userId, data.user.id));

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    };
  })