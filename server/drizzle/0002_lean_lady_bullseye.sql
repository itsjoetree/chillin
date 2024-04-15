DO $$ BEGIN
 CREATE TYPE "site_variant" AS ENUM('chillin', 'charismatic', 'grounded', 'cool');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "site_variant" "site_variant" DEFAULT 'chillin' NOT NULL;