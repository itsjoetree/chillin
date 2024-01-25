import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import { AuthSession, createClient } from "@supabase/supabase-js";
import { users } from "../controllers/users";
import { auth } from "../controllers/auth";
import { posts } from "../controllers/posts";
import { profiles } from "../controllers/profiles";
import { feeds } from "../controllers/feeds";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
export type AuthToken = Pick<AuthSession, "access_token" | "refresh_token">;
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .use(auth)
  .use(users)
  .use(posts)
  .use(profiles)
  .use(feeds)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

//app.handle(new Request("http://localhost/")).then(console.log)