import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Post, post } from "../schema/post";
import { count, gt, eq, and } from "drizzle-orm";
import { likedPost } from "../schema/likedPost";
import { comment } from "../schema/comment";
import { followRelationship } from "../schema/followRelationship";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";

export const feeds = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/feed" })
  .get("", async (req): Promise<Post[]> => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const cursor = req.query["cursor"] ? Number(req.query["cursor"]) : undefined;
    const take = Number(req.query["take"] ?? 10);

    const postsQuery = db
      .select({
        id: post.id,
        authorId: post.authorId,
        text: post.text,
        dateCreated: post.dateCreated,
        updatedAt: post.updatedAt,
        seen: post.seen,
        likes: count(likedPost.id),
        commentCount: count(comment.id)
      })
      .from(post)
      .limit(take)
      .leftJoin(followRelationship, eq(post.authorId, followRelationship.followeeId))
      .leftJoin(likedPost, eq(post.id, likedPost.postId))
      .leftJoin(comment, eq(post.id, comment.postId))
      .groupBy(post.id);

    if (cursor)
      postsQuery.where(and(
       gt(post.id, cursor),
       eq(followRelationship.followerId, currentProfile.id))
      );
    else
      postsQuery.where(eq(followRelationship.followerId, currentProfile.id));

    return await postsQuery;
  });