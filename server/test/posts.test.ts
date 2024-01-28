import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SignUpRequest } from "../models/SignUpRequest";
import { profile } from "../schema/profile";
import { and, eq } from "drizzle-orm";
import { adminSupabase, db, supabase, testFetch } from "./setup";
import { PostRequestBody, post } from "../schema/post";
import { getProfile } from "../libs/getProfile";
import { CommentRequestBody, comment } from "../schema/comment";
import { likedPost } from "../schema/likedPost";
import { likedComment } from "../schema/likedComment";
import { replyComment } from "../schema/replyComment";

const testUser: SignUpRequest = {
  email: "posttest@chillin.tech",
  password: "testing123",
  username: "posttest",
  nickname: "posttest",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

let accessToken = "";
let user_id = "";
let post_id = 0;
let comment_id = 0;
let reply_comment_id = 0;
const headers = { authorization: `Bearer ${accessToken}` };

const postBody: PostRequestBody = {
  text: "This is a test post!"
}

describe("posts", () => {
  beforeAll(async () => {
    const { data } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    await db.update(profile)
      .set({
        username: testUser.username,
        nickname: testUser.nickname,
        siteVariant: testUser.siteVariant,
        birthday: testUser.birthday
      })
      .where(eq(profile.userId, data.user!.id));

    headers.authorization = `Bearer ${data.session!.access_token}`;
    user_id = data.user!.id!;
  });

  test("creates post", async () => {
    await testFetch("/api/post", {
      method: "POST",
      body: JSON.stringify(postBody),
      headers
    });

    // Lookup
    const userProfile = await getProfile(db, supabase, headers);
    const postResult = await db.select().from(post).where(eq(post.authorId, userProfile.id));
    post_id = postResult[0].id;

    expect(postResult[0].authorId).toBe(userProfile.id);
    expect(postResult[0].text).toBe(postBody.text);
  });

  test("gets post", async () => {
    const { data } = await testFetch("/api/post/:postId", {
      params: { 
        postId: post_id.toString()
      },
      method: "GET",
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);

    expect(data?.authorId).toBe(userProfile.id);
    expect(data?.text).toBe(postBody.text);
  });

  test("likes post", async () => {
    await testFetch("/api/post/:postId/like", {
      params: { 
        postId: post_id.toString()
      },
      method: "POST",
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);
    const likeRelationship = await db.select().from(likedPost).where(eq(likedPost.postId, post_id));
    expect(likeRelationship[0].profileId).toBe(userProfile.id);
  });

  test("unlikes post", async () => {
    await testFetch("/api/post/:postId/unlike", {
      params: { 
        postId: post_id.toString()
      },
      method: "DELETE",
      headers
    });

    const likeRelationship = await db.select().from(likedPost).where(eq(likedPost.postId, post_id));
    expect(likeRelationship).toBeEmpty();
  });

  test("creates post comment", async () => {
    const requestBody: CommentRequestBody = {
      content: "This is a test comment!"
    };

    await testFetch("/api/post/:postId/comments", {
      params: { 
        postId: post_id.toString()
      },
      method: "POST",
      body: JSON.stringify(requestBody),
      headers
    });

    // Lookup
    const commentResult = await db.select().from(comment).where(eq(comment.postId, post_id));
    comment_id = commentResult[0]?.id;
    expect(commentResult[0]?.content).toBe(requestBody.content);
  });

  test("likes post comment", async () => {
    await testFetch("/api/post/:postId/comments/:commentId/like", {
      params: { 
        postId: post_id.toString(),
        commentId: comment_id.toString()
      },
      method: "POST",
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);
    const likedRelationship = await db.select().from(likedComment).where(and(
      eq(likedComment.commentId, comment_id),
      eq(likedComment.profileId, userProfile.id)
    ));
    
    expect(likedRelationship).toBeArrayOfSize(1);
  });

  test("unlikes post comment", async () => {
    await testFetch("/api/post/:postId/comments/:commentId/unlike", {
      params: { 
        postId: post_id.toString(),
        commentId: comment_id.toString()
      },
      method: "DELETE",
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);
    const likedRelationship = await db.select().from(likedComment).where(and(
      eq(likedComment.commentId, comment_id),
      eq(likedComment.profileId, userProfile.id)
    ));
    
    expect(likedRelationship).toBeEmpty();
  });

  test("replies to comment", async () => {
    const replyBody: CommentRequestBody = {
      content: "This is a test reply!"
    };

    await testFetch("/api/post/:postId/comments/:commentId", {
      params: { 
        postId: post_id.toString(),
        commentId: comment_id.toString()
      },
      method: "POST",
      body: JSON.stringify(replyBody),
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);

    const replyResult = await db
      .select()
      .from(replyComment)
      .where(eq(replyComment.authorId, userProfile.id));

    reply_comment_id = replyResult[0]?.id;

    expect(replyResult[0]?.content).toBe(replyBody.content);
  });

  test("deletes reply to comment", async () => {
    const replyBody: CommentRequestBody = {
      content: "This is a test reply!"
    };

    await testFetch("/api/post/:postId/comments/:commentId/:replyId", {
      params: {
        replyId: reply_comment_id.toString(),
        postId: post_id.toString(),
        commentId: comment_id.toString()
      },
      method: "DELETE",
      body: JSON.stringify(replyBody),
      headers
    });

    const userProfile = await getProfile(db, supabase, headers);

    const replyResult = await db.select().from(replyComment)
      .where(and(
        eq(replyComment.authorId, userProfile.id),
        eq(replyComment.commentId, comment_id)
      ));

    expect(replyResult).toBeEmpty();
  });

  test("deletes comment", async () => {
    await testFetch("/api/post/:postId/comments/:commentId", {
      params: { 
        postId: post_id.toString(),
        commentId: comment_id.toString()
      },
      method: "DELETE",
      headers
    });

    const commentResult = await db.select().from(comment).where(eq(comment.id, comment_id));
    expect(commentResult).toBeEmpty();
  })

  test("deletes post", async () => {
    await testFetch("/api/post/:postId", {
      params: { 
        postId: post_id.toString()
      },
      method: "DELETE",
      headers
    });
    
    const postResult = await db.select().from(post).where(eq(post.id, post_id));
    expect(postResult).toBeEmpty();
  })

  afterAll(async () => {
    const check = await db.select().from(profile).where(eq(profile.userId, user_id));
    const checkProfile = check[0];

    await db.delete(profile).where(eq(profile.id, checkProfile.id));
    await adminSupabase.auth.admin.deleteUser(checkProfile.userId!);
  });
});