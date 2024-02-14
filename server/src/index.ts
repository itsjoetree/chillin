import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import { createClient } from "@supabase/supabase-js";
import { users } from "../controllers/users";
import { auth } from "../controllers/auth";
import { posts } from "../controllers/posts";
import { profiles } from "../controllers/profiles";
import { feeds } from "../controllers/feeds";
import postgres from "postgres";
import { comments } from "../controllers/comments";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
          title: "chillin",
          version: "0.0.1",
          description: "API documentation for chillin"
      }
  }
  }))
  .use(cors({
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(auth(db, supabase))
  .use(users(db, supabase))
  .use(posts(db, supabase))
  .use(profiles(db, supabase))
  .use(feeds(db, supabase))
  .use(comments(db, supabase))
  .listen(3000);

export type Api = typeof app;

console.log(
  `chillin is running at ${app.server?.hostname}:${app.server?.port}`
);