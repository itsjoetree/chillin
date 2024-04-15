import Elysia from "elysia";
import { getProfile } from "../libs/getProfile";
import { Post, post } from "../schema/post";
import { count, gt, eq, and, exists, SQL, lt, desc, isNull } from "drizzle-orm";
import { likedPost } from "../schema/likedPost";
import { comment } from "../schema/comment";
import { followRelationship } from "../schema/followRelationship";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { profile } from "../schema/profile";
import { subWeeks } from "date-fns";
import { seenPost } from "../schema/seenPost";

export type FeedResponse = {
  items: Post[];
  cursor?: number;
};

export const feeds = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/feed" })
  .get("", async (req): Promise<FeedResponse> => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    // Determines if the user wants to see older posts
    const showOlder = req.query["showOlder"] === "true";

    // Determines the cursor for pagination
    const cursor = req.query["cursor"] ? Number(req.query["cursor"]) : undefined;
    const username = req.query["username"] as string | undefined;

    // Number of records to load at a time
    const take = 10;

    // Base Posts query
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
        likedByViewer: exists(
          db.select().from(likedPost).where(and(
            eq(likedPost.postId, post.id),
            eq(likedPost.profileId, currentProfile.id)
          ))
        ) as SQL<boolean>
      })
      .from(post)
      .limit(take)
      .leftJoin(profile, eq(post.authorId, profile.id));

    // If username is specified, prepare for profile feed view
    if (username) {
      if (cursor) postsQuery.where(and(lt(post.id, cursor), eq(profile.username, username)));
      else postsQuery.where(eq(profile.username, username));
    }
    // Prepare for home feed view
    else {
      // If showing older posts, inner join to get only seen posts by default
      if (showOlder)
        postsQuery.innerJoin(seenPost, eq(post.id, seenPost.postId));
      else
        postsQuery.leftJoin(seenPost, eq(post.id, seenPost.postId))
          .innerJoin(followRelationship, eq(post.authorId, followRelationship.followeeId));

        // Dates to query for posts within the past week
        const todaysDate = new Date();
        const lastWeek = subWeeks(todaysDate, 1);

        const andConditions = [
          gt(post.dateCreated, lastWeek),
          eq(followRelationship.followerId, currentProfile.id)
        ]

        // If not showing older posts, add condition to only get unseen posts
        if (!showOlder)
          andConditions.push(isNull(seenPost.id));

        postsQuery.where(and(...andConditions));
    }
 
    postsQuery.orderBy(desc(post.dateCreated)).groupBy(post.id, profile.id);

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

    if (!showOlder && !username)
      await db.insert(seenPost).values(posts.map(p => ({ postId: p.id, profileId: currentProfile.id })));

    return {
      items: posts,
      cursor: (posts.length && posts.length % 10 === 0) ? posts[posts.length - 1].id : undefined
    };
  });