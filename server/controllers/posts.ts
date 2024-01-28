import Elysia from "elysia";
import { comment, commentSchema } from "../schema/comment";
import { getProfile } from "../libs/getProfile";
import { count, eq, gt, and, exists, SQL } from "drizzle-orm";
import { replyComment } from "../schema/replyComment";
import { Post, post, postSchema } from "../schema/post";
import { likedPost } from "../schema/likedPost";
import { profile } from "../schema/profile";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";
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
        seen: post.seen,
        likes: count(likedPost.id),
        commentCount: count(comment.id),
        likedByViewer: exists(
          db.select().from(likedPost).where(and(
            eq(likedPost.postId, post.id),
            eq(likedPost.profileId, currentProfile.id)
          ))
        ) as SQL<boolean>
      })
      .from(post)
      .limit(take)
      .leftJoin(likedPost, eq(post.id, likedPost.postId))
      .leftJoin(comment, eq(post.id, comment.postId));
    
    if (cursor)
      postsQuery.where(and(gt(post.id, cursor), eq(post.authorId, user[0].id)));
    else
      postsQuery.where(eq(post.authorId, user[0].id));

    return await postsQuery.groupBy(post.id);;
  })
  .get("/:postId", async (req): Promise<Post> => {
    const postId = Number(req.params["postId"]);

    const postResult = await db
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
      .leftJoin(likedPost, eq(post.id, likedPost.postId))
      .leftJoin(comment, eq(post.id, comment.postId))
      .where(eq(post.id, postId))
      .groupBy(post.id);
    
    const comments = await db
      .select()
      .from(comment)
      .where(eq(comment.postId, postId));

    const result = {
      ...postResult[0],
      comments
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
  .post("/:postId/comments/:commentId", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const body = commentSchema.parse({
      ...JSON.parse(String(req.body)),
      postId
    });

    if (body.content.length > 500)
      throw new Error("Content must not exceed 500 characters");

    const currentComment = await db
      .select()
      .from(comment)
      .where(and(eq(comment.postId, postId), eq(comment.id, commentId)));

    if (!currentComment[0])
      throw new Error("Comment does not exist");

    await db.insert(replyComment).values({
      commentId: commentId,
      content: body.content,
      authorId: currentProfile.id
    });
  })
  .post("/:postId/comments/:commentId/like", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const currentPost = await db.select().from(post).where(eq(post.id, postId));
    if (!currentPost[0])
      throw new Error("Post does not exist");

    const commentToLike = await db.select().from(comment).where(eq(comment.id, commentId));

    if (!commentToLike[0])
      throw new Error("Comment does not exist");

    await db.insert(likedComment).values({
      commentId: commentId,
      profileId: currentProfile.id
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
  .delete("/:postId/comments/:commentId", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const currentPost = await db.select().from(post).where(eq(post.id, postId));
    const commentToDelete = await db
      .select()
      .from(comment)
      .where(eq(comment.id, commentId));

    if (
      currentPost[0].authorId !== currentProfile.id &&
      commentToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(comment).where(eq(comment.id, commentId));
  })
  .delete("/:postId/comments/:commentId/:replyId", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const replyId = Number(req.params.replyId);

    const checkComment = await db
      .select({
        postAuthorId: post.authorId
      })
      .from(comment)
      .innerJoin(post, eq(comment.postId, post.id))
      .where(
        and(
          eq(comment.postId, postId), eq(comment.id, commentId)
        )
    );

    if (!checkComment[0])
      throw new Error("Comment does not exist");

    const commentToDelete = await db
      .select()
      .from(replyComment)
      .where(eq(replyComment.id, replyId));

    if (
      checkComment[0].postAuthorId !== currentProfile.id &&
      commentToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(replyComment).where(eq(replyComment.id, replyId));
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
  .delete("/:postId/comments/:commentId/unlike", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const postId = Number(req.params["postId"]);
    const commentId = Number(req.params["commentId"]);

    const currentPost = await db.select().from(post).where(eq(post.id, postId));
    if (!currentPost[0])
      throw new Error("Post does not exist");

    const commentToUnlike = await db.select().from(comment).where(eq(comment.id, commentId));

    if (!commentToUnlike[0])
      throw new Error("Comment does not exist");

    const commentLikeRelationship = await db.select().from(likedComment).where(and(
      eq(likedComment.commentId, commentId),
      eq(likedComment.profileId, currentProfile.id)
    ));

    await db.delete(likedComment).where(eq(likedComment.id, commentLikeRelationship[0].id));
  })