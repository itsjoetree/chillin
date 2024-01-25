import Elysia from "elysia";
import { comment, commentSchema } from "../schema/comment";
import { getProfile } from "../libs/getProfile";
import { db } from "../src";
import { count, eq, gt } from "drizzle-orm";
import { replyComment } from "../schema/replyComment";
import { Post, post, postSchema } from "../schema/post";
import { likedPost } from "../schema/likedPost";
import { profile } from "../schema/profile";

export const posts = new Elysia({ prefix: "/api/post" })
  .get("", async (req): Promise<Post[]> => {
    await getProfile(req.headers);

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
        commentCount: count(comment.id)
      })
      .from(post)
      .leftJoin(likedPost, eq(post.id, likedPost.postId))
      .leftJoin(comment, eq(post.id, comment.postId))
      .limit(take);
    
    if (cursor)
      postsQuery.where(gt(post.id, cursor) && eq(post.authorId, user[0].id));
    else
      postsQuery.where(eq(post.authorId, user[0].id));

    return await postsQuery;
  })
  .post("", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const body = postSchema.parse(JSON.parse(String(req.body)));

    if (body.text.length > 1000)
      throw new Error("Text is too long");

    await db.insert(post).values({
      authorId: currentProfile.id,
      text: body.text
    });
  })
  .post("/:postId/comments", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const postId = Number(req.params["postId"]);

    const body = commentSchema.parse(JSON.parse(String(req.body)));

    if (body.content.length > 500)
      throw new Error("Content must not exceed 500 characters");

    await db.insert(comment).values({
      postId: postId,
      content: body.content,
      authorId: currentProfile.id
    });
  })
  .post("/:postId/comments/:commentId", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const body = commentSchema.parse(JSON.parse(String(req.body)));

    if (body.content.length > 500)
      throw new Error("Content must not exceed 500 characters");

    const currentComment = await db.select().from(comment)
      .where(eq(comment.postId, postId) && eq(comment.id, commentId));

    if (!currentComment[0])
      throw new Error("Comment does not exist");

    db.insert(replyComment).values({
      commentId: commentId,
      content: body.content,
      authorId: currentProfile.id
    })
  })
  .post("/:postId/like", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const postId = Number(req.params["postId"]);

    await db.insert(likedPost).values({
      postId: postId,
      profileId: currentProfile.id
    });
  })
  .delete("/:postId", async (req) => {
    const currentProfile = await getProfile(req.headers);
    
    const postId = Number(req.params.postId);

    const postToDelete = await db.select().from(post).where(eq(post.id, postId));

    if (
      postToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(post).where(eq(post.id, postId));
  })
  .delete("/:postId/comments/:commentId", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const postId = Number(req.params["postId"]);
    const commentId = Number(req.params["commentId"]);

    const currentPost = await db.select().from(post).where(eq(post.id, postId));
    const commentToDelete = await db.select().from(comment).where(eq(comment.id, commentId));

    if (
      currentPost[0].authorId !== currentProfile.id &&
      commentToDelete[0].authorId !== currentProfile.id &&
      currentProfile.role !== "admin"
    )
      throw new Error("Unauthorized");

    await db.delete(comment).where(eq(comment.id, commentId));
  })
  .delete("/:postId/unlike", async (req) => {
    const currentProfile = await getProfile(req.headers);
    const postId = Number(req.params["postId"]);

    const relationship = await db
      .select()
      .from(likedPost)
      .where(eq(likedPost.postId, postId) && eq(likedPost.profileId, currentProfile.id));

    await db.delete(likedPost).where(eq(likedPost.id, relationship[0].id));
  })