CREATE TABLE IF NOT EXISTS "seen_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"updated_at" date,
	CONSTRAINT "seen_posts_post_id_profile_id_unique" UNIQUE("post_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "seen";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seen_posts" ADD CONSTRAINT "seen_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seen_posts" ADD CONSTRAINT "seen_posts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
