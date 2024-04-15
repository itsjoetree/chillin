ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "follow_relationships" DROP CONSTRAINT "follow_relationships_followee_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "liked_comment" DROP CONSTRAINT "liked_comment_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "liked_post" DROP CONSTRAINT "liked_post_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "reply_comments" DROP CONSTRAINT "reply_comments_comment_id_comments_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow_relationships" ADD CONSTRAINT "follow_relationships_followee_id_profiles_id_fk" FOREIGN KEY ("followee_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_comment" ADD CONSTRAINT "liked_comment_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_post" ADD CONSTRAINT "liked_post_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply_comments" ADD CONSTRAINT "reply_comments_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
