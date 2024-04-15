ALTER TABLE "comments" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "reply_comments" ALTER COLUMN "date_created" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "reply_comments" ALTER COLUMN "date_created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "reply_comments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "reply_comments" ALTER COLUMN "updated_at" SET DEFAULT now();