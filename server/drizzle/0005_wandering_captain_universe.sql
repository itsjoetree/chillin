DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('user', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follow_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"followee_id" integer NOT NULL,
	"follower_id" integer NOT NULL,
	"updated_at" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liked_comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"updated_at" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liked_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"profile_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reply_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" varchar(500) NOT NULL,
	"date_created" date,
	"updated_at" date
);
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seen" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "likes";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow_relationships" ADD CONSTRAINT "follow_relationships_followee_id_profiles_id_fk" FOREIGN KEY ("followee_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow_relationships" ADD CONSTRAINT "follow_relationships_follower_id_profiles_id_fk" FOREIGN KEY ("follower_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_comment" ADD CONSTRAINT "liked_comment_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_comment" ADD CONSTRAINT "liked_comment_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_post" ADD CONSTRAINT "liked_post_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_post" ADD CONSTRAINT "liked_post_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply_comments" ADD CONSTRAINT "reply_comments_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply_comments" ADD CONSTRAINT "reply_comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
