import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Post, post } from "../schema/post";
import { count, gt, eq, and, exists, SQL } from "drizzle-orm";
import { likedPost } from "../schema/likedPost";
import { comment } from "../schema/comment";
import { followRelationship } from "../schema/followRelationship";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { profile } from "../schema/profile";

export const feeds = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/feed" })
  .get("", async (req): Promise<Post[]> => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const cursor = req.query["cursor"] ? Number(req.query["cursor"]) : undefined;
    const take = Number(req.query["take"] ?? 10);

    const postsQuery = db
      .select({
        id: post.id,
        authorId: post.authorId,
        author: {
          username: profile.username,
          avatarUrl: profile.avatarUrl
        },
        text: post.text,
        dateCreated: post.dateCreated,
        updatedAt: post.updatedAt,
        seen: post.seen,
        likedByViewer: exists(
          db.select().from(likedPost).where(and(
            eq(likedPost.postId, post.id),
            eq(likedPost.profileId, currentProfile.id)
          ))
        ) as SQL<boolean>
      })
      .from(post)
      .limit(take)
      .leftJoin(profile, eq(post.authorId, profile.id))
      .innerJoin(followRelationship, eq(post.authorId, followRelationship.followeeId))
      .groupBy(post.id, profile.id);

    if (cursor)
      postsQuery.where(and(
       gt(post.id, cursor),
       eq(followRelationship.followerId, currentProfile.id))
      );
    else
      postsQuery.where(eq(followRelationship.followerId, currentProfile.id));

    const postsResult = await postsQuery;

    const posts: Post[] = await Promise.all(postsResult.map(async (pr) => {
      const likes = await db.select({ likes: count(likedPost.id) }).from(likedPost).where(eq(likedPost.postId, pr.id));
      const commentCount = await db.select({ commentCount: count(comment.id) }).from(comment).where(eq(comment.postId, pr.id));

      return {
        ...pr,
        likes: likes[0].likes,
        commentCount: commentCount[0].commentCount
      }
    }));

    return posts;
  });