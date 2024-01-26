import { AuthSession } from "@supabase/supabase-js";

export type AuthToken = Pick<AuthSession, "access_token" | "refresh_token">;