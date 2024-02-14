import Elysia from "elysia";
import { formSchema as signInSchema } from "../models/signInRequest";
import { formSchema as signUpSchema } from "../models/signUpRequest";
import { AuthToken } from "../types";
import { profile } from "../schema/profile";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO, startOfDay, subYears } from "date-fns";

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
      password: body.password
    });

    if (error || !data?.session || !data?.user)
      throw new Error("SignUpFailed");

    const birthdayDate = parseISO(body.birthday);
    const today = startOfDay(new Date());
    const eighteenYearsAgo = subYears(today, 18);

    if (birthdayDate > eighteenYearsAgo)
      throw new Error("AgeVerificationFailed");
    
    await db.update(profile)
      .set({
        username: body.username.replace(/[^a-zA-Z0-9]/g, "").trim().toLowerCase(),
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