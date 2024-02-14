CREATE TABLE IF NOT EXISTS "comment_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "comment_relationships_parent_id_child_id_unique" UNIQUE("parent_id","child_id")
);
--> statement-breakpoint
DROP TABLE "reply_comments";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_relationships" ADD CONSTRAINT "comment_relationships_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_relationships" ADD CONSTRAINT "comment_relationships_child_id_comments_id_fk" FOREIGN KEY ("child_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
