ALTER TABLE "liked_comment" DROP CONSTRAINT "liked_comment_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "liked_post" DROP CONSTRAINT "liked_post_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "reply_comments" DROP CONSTRAINT "reply_comments_author_id_profiles_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_comment" ADD CONSTRAINT "liked_comment_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_post" ADD CONSTRAINT "liked_post_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply_comments" ADD CONSTRAINT "reply_comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
