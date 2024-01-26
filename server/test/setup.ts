// TODO: Research how to use with CI/CD
require("dotenv").config({ path: "./.env.local" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { profiles } from "../controllers/profiles";
import { edenFetch } from "@elysiajs/eden";
import { auth } from "../controllers/auth";
import { users } from "../controllers/users";
import { posts } from "../controllers/posts";
import Elysia from "elysia";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
export const adminSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const app = new Elysia()
  .use(auth(db, supabase))
  .use(profiles(db, supabase))
  .use(users(db, supabase))
  .use(posts(db, supabase))
  .listen(3000);

export const testFetch = edenFetch<typeof app>("http://localhost:3000");