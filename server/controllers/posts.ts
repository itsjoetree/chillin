import Elysia from "elysia";
import { comment, commentSchema } from "../schema/comment";
import { getProfile } from "../libs/getProfile";
import { count, eq, gt, and, exists, SQL } from "drizzle-orm";
import { Post, post, postSchema } from "../schema/post";
import { likedPost } from "../schema/likedPost";
import { profile } from "../schema/profile";
import { alias } from "drizzle-orm/pg-core";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { commentRelationship } from "../schema/commentRelationship";
import { PostWithComments, CommentThread } from "../types";
import { likedComment } from "../schema/likedComment";

export const posts = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/post" })
  .get("", async (req): Promise<Post[]> => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const cursor = req.query["cursor"] ? Number(req.query["cursor"]) : undefined;
    const take = Number(req.query["take"] ?? 10);
    const username = String(req.query["username"]);

    // lookup user
    const user = await db.select().from(profile).where(eq(profile.username, username));

    const postsQuery = db
      .select({
        id: post.id,
        authorId: post.authorId,
        text: post.text,
        dateCreated: post.dateCreated,
        updatedAt: post.updatedAt,
        author: {
          username: profile.username,
          avatarUrl: profile.avatarUrl
        },
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
    
    if (cursor)
      postsQuery.where(and(gt(post.id, cursor), eq(post.authorId, user[0].id)));
    else
      postsQuery.where(eq(post.authorId, user[0].id));

    const postResult = await postsQuery;

    const posts: Post[] = await Promise.all(postResult.map(async (pr) => {
      const likes = await db.select({ likes: count(likedPost.id) }).from(likedPost).where(eq(likedPost.postId, pr.id));
      const commentCount = await db.select({ commentCount: count(comment.id) }).from(comment).where(eq(comment.postId, pr.id));

      return {
        ...pr,
        likes: likes[0].likes,
        commentCount: commentCount[0].commentCount
      }
    }));

    return posts;
  })
  .get("/:postId", async (req): Promise<Post> => {
    const currentProfile = await getProfile(db, supabase, req.headers);

    const postId = Number(req.params["postId"]);

    const postQuery = db
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
      .where(eq(post.id, postId))
      .leftJoin(profile, eq(post.authorId, profile.id))

    const postResult = await postQuery;

    const likes = await db
      .select({ likes: count(likedPost.id) })
      .from(likedPost)
      .where(eq(likedPost.postId, postId));

    const commentCount = await db
      .select({ commentCount: count(comment.id) })
      .from(comment)
      .where(eq(comment.postId, postId));

    const result: PostWithComments = {
      ...postResult[0],
      likes: likes[0].likes,
      commentCount: commentCount[0].commentCount
    };

    return result;
  })
  .post("", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const body = postSchema.parse(JSON.parse(String(req.body)));

    if (body.text.length > 1000)
      throw new Error("Text is too long");

    await db.insert(post).values({
      authorId: currentProfile.id,
      text: body.text
    });
  })
  // IN PROGRESS / UNSTABLE
  .get("/:postId/comments", async (req): Promise<CommentThread[]> => {
    // Send and receive a cursor map, to keep track of last comment in each thread.
    const currentProfile = await getProfile(db, supabase, req.headers);

    const prepareRepliesRecurse = async (commentId: number, thread: CommentThread | null) => {
      const commentById = await db.select({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        author: {
          username: profile.username,
          avatarUrl: profile.avatarUrl
        },
        updatedAt: comment.updatedAt,
        content: comment.content,
        dateCreated: comment.dateCreated,
      })
      .from(comment)
      .innerJoin(profile, eq(comment.authorId, profile.id))
      .where(eq(comment.id, commentId));

      const childComment = alias(comment, "child_comment");

      const repliesQuery = db.select({
        id: childComment.id,
        postId: childComment.postId,
        authorId: childComment.authorId,
        updatedAt: childComment.updatedAt,
        content: childComment.content,
        dateCreated: childComment.dateCreated,
        author: {
          username: profile.username,
          avatarUrl: profile.avatarUrl
        },
        likedByViewer: exists(
          db.select().from(likedComment).where(and(
            eq(likedComment.commentId, childComment.id),
            eq(likedComment.profileId, currentProfile.id)
          ))) as SQL<boolean>
      })
      .from(commentRelationship)
      .innerJoin(childComment, eq(commentRelationship.childId, childComment.id))
      .leftJoin(profile, eq(childComment.authorId, profile.id));

      const replyCursorMap: { commentId: number, cursor: number }[] = [];

      const cursorEntry = replyCursorMap.find(rcm => rcm.commentId === commentId);

      if (cursorEntry)
        repliesQuery.where(and(
          eq(commentRelationship.parentId, commentId),
          gt(commentRelationship.childId, cursorEntry.cursor)
        ));
      else
        repliesQuery.where(eq(commentRelationship.parentId, commentId));
      
      const repliesResult = await repliesQuery;
      const replies = await Promise.all(repliesResult.map(async (rr) => {
        const likeCount = await db.select({ likeCount: count(likedComment.id) }).from(likedComment).where(eq(likedComment.commentId, rr.id));
        const replyCount = await db.select({ replyCount: count(commentRelationship.childId) }).from(commentRelationship).where(eq(commentRelationship.parentId, rr.id));

        return ({
          ...rr,
          likeCount: likeCount[0].likeCount,
          replyCount: replyCount[0].replyCount
        })
      }));

      if (replies.length === 0) {
        if (!thread) {
          const likes = await db.select({ likeCount: count(likedComment.id) }).from(likedComment).where(eq(likedComment.commentId, commentId));

          return {
            ...commentById[0],
            likeCount: likes[0].likeCount,
            replies: []
          }  
        }

        else return thread;
      }
      
      if (!thread)
        thread = {
          ...commentById[0],
          
          replies: []
        };

      // Add replies
      for (const reply of replies) {
        const newThread = {
          ...reply,
          replies: []
        }

        thread.replies?.push(newThread);
        await prepareRepliesRecurse(reply.id, newThread);
      }

      return thread;
    }

    // Used to retrieve replies to a specific comment rather than post.
    // const parentCommentId = req.query["parentCommentId"] ? Number(req.query["parentCommentId"]) : null;
    // const cursorMap: { commentId: string; cursor: string }[] = req.query["cursorMap"] ? JSON.parse(String(req.query["cursorMap"])) : [];
    // // const postId = Number(req.params["postId"]);
    
    const commentsQuery = db.select({
      id: comment.id
    })
    .from(comment)
    .leftJoin(commentRelationship, eq(comment.id, commentRelationship.childId))

    // const cursorEntry = cursorMap.find(cm => cm.commentId === String(parentCommentId));

    // TODO: Apply cursor
    const commentsResult = await commentsQuery;
    const threads = await Promise.all(commentsResult.map(async (cr) => await prepareRepliesRecurse(cr.id, null)));
    return threads;
  })
  .post("/:postId/comments", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);

    const body = commentSchema.parse({
      ...JSON.parse(String(req.body)),
      postId
    });

    if (body.content.length > 500)
      throw new Error("Content must not exceed 500 characters");

    await db.insert(comment).values({
      postId: postId,
      content: body.content,
      authorId: currentProfile.id
    });
  })
  .post("/:postId/like", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);

    await db.insert(likedPost).values({
      postId: postId,
      profileId: currentProfile.id
    });
  })
  .delete("/:postId", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);

    const postToDelete = await db
      .select()
      .from(post)
      .where(eq(post.id, postId));

    if (
      postToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(post).where(eq(post.id, postId));
  })
  .delete("/:postId/unlike", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params["postId"]);

    const relationship = await db
      .select()
      .from(likedPost)
      .where(and(eq(likedPost.postId, postId), eq(likedPost.profileId, currentProfile.id)));

    await db.delete(likedPost).where(eq(likedPost.id, relationship[0].id));
  })