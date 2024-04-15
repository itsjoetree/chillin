import Elysia from "elysia";
import { formSchema as signInSchema } from "../models/SignInRequest";
import { formSchema as signUpSchema } from "../models/SignUpRequest";
import { AuthToken } from "../types";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO, startOfDay, subYears } from "date-fns";

export const auth = (_db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/auth" })
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
  // NOTE: Currently implemented with email verification off
  .post("/sign-up", async (req): Promise<AuthToken> => {
    const body = signUpSchema.parse(JSON.parse(String(req.body)));

    const birthdayDate = parseISO(body.birthday);
    const today = startOfDay(new Date());
    const eighteenYearsAgo = subYears(today, 18);

    if (birthdayDate > eighteenYearsAgo)
      throw new Error("ageVerificationFailed");

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username.replace(/[^a-zA-Z0-9]/g, "").trim().toLowerCase(),
          nickname: body.nickname,
          birthday: body.birthday
        }
      }
    });

    if (error || !data?.session || !data?.user)
      throw new Error("signUpFailed");

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    };
  })