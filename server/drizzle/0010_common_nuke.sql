ALTER TABLE "liked_post" ADD CONSTRAINT "liked_post_post_id_profile_id_unique" UNIQUE("post_id","profile_id");