import { SupabaseClient } from "@supabase/supabase-js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { comment, commentSchema } from "../schema/comment";
import { and, eq } from "drizzle-orm";
import { getProfile } from "../libs/getProfile";
import { likedComment } from "../schema/likedComment";
import { post } from "../schema/post";
import { commentRelationship } from "../schema/commentRelationship";
import Elysia, { NotFoundError } from "elysia";

export const comments = (db: PostgresJsDatabase, supabase: SupabaseClient) => new Elysia({ prefix: "/api/comment" })
  .post("/:commentId/reply", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const commentId = Number(req.params.commentId);

    const body = commentSchema.parse(JSON.parse(String(req.body)));

    if (body.content.length > 500)
      throw new Error("Content must not exceed 500 characters");

    const currentComment = await db
      .select()
      .from(comment)
      .where(eq(comment.id, commentId));

    if (!currentComment[0])
      throw new Error("Comment does not exist");

    await db.transaction(async (db) => {
      const result = await db.insert(comment).values({
        postId: currentComment[0].postId,
        content: body.content,
        authorId: currentProfile.id
      }).returning({ insertedId: comment.id });
  
      await db.insert(commentRelationship).values({
        parentId: commentId,
        childId: result[0].insertedId
      });
    });
  })
  .post("/:commentId/like", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const commentId = Number(req.params.commentId);

    const commentToLike = await db.select().from(comment).where(eq(comment.id, commentId));

    if (!commentToLike[0])
      throw new Error("Comment does not exist");

    await db.insert(likedComment).values({
      commentId: commentId,
      profileId: currentProfile.id
    });
  })
  .delete("/:commentId", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const commentId = Number(req.params.commentId);

    const commentToDelete = await db
      .select({
        postId: comment.postId,
        authorId: comment.authorId
      })
      .from(comment)
      .where(eq(comment.id, commentId));

    if (!commentToDelete[0])
      throw NotFoundError;

    const currentPost = await db.select({ authorId: post.authorId }).from(post).where(eq(post.id, commentToDelete[0].postId));

    if (
      currentPost[0].authorId !== currentProfile.id &&
      commentToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(comment).where(eq(comment.id, commentId));
  })
  .delete("/:commentId/unlike", async (req) => {
    const currentProfile = await getProfile(db, supabase, req.headers);
    const commentId = Number(req.params["commentId"]);

    const commentToUnlike = await db.select().from(comment).where(eq(comment.id, commentId));

    if (!commentToUnlike[0])
      throw new Error("Comment does not exist");

    const commentLikeRelationship = await db.select().from(likedComment).where(and(
      eq(likedComment.commentId, commentId),
      eq(likedComment.profileId, currentProfile.id)
    ));

    await db.delete(likedComment).where(eq(likedComment.id, commentLikeRelationship[0].id));
  });