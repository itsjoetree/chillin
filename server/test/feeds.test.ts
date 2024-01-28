import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SignUpRequest } from "../models/SignUpRequest";
import { profile } from "../schema/profile";
import { eq, or } from "drizzle-orm";
import { adminSupabase, db, supabase, testFetch } from "./setup";
import { followRelationship } from "../schema/followRelationship";
import { PostRequestBody, post } from "../schema/post";
import { CommentRequestBody, comment } from "../schema/comment";
import { likedPost } from "../schema/likedPost";

const follower: SignUpRequest = {
  email: "feedtestfollower@chillin.tech",
  password: "testing123",
  username: "feedtestfollower",
  nickname: "feedtestfollower",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

const followee: SignUpRequest = {
  email: "feedtestfollowee@chillin.tech",
  password: "testing123",
  username: "feedtestfollowee",
  nickname: "feedtestfollowee",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

let accessToken = "";
let followeeProfileId = 0;

const followeePosts: PostRequestBody[] = [
  {
    text: "This is a test post!"
  },
  {
    text: "This is another test post!"
  }
];

const postLikesMap: Record<string, number> = {
  "This is a test post!": 0,
  "This is another test post!": 1
};

const postCommentsMap: Record<string, CommentRequestBody[]> = {
  "This is a test post!": [
    {
      content: "This is a test comment!"
    },
    {
      content: "Yeah this is it!"
    },
    {
      content: "Hey, what's up?"
    }
  ],
  "This is another test post!": [
    {
      content: "It was raining today"
    }
  ]
}

describe("feeds", () => {
  // Set up a relation between two users where the folowee has posts
  beforeAll(async () => {
    const { data: followerData } = await supabase.auth.signUp({
      email: follower.email,
      password: follower.password
    });

    const { data: followeeData } = await supabase.auth.signUp({
      email: followee.email,
      password: followee.password
    });

    accessToken = followerData.session!.access_token!;

    await db.update(profile)
      .set({
        username: follower.username,
        nickname: follower.nickname,
        siteVariant: follower.siteVariant,
        birthday: follower.birthday
      })
      .where(eq(profile.userId, followerData.user!.id));

    await db.update(profile)
      .set({
        username: followee.username,
        nickname: followee.nickname,
        siteVariant: followee.siteVariant,
        birthday: followee.birthday
      })
      .where(eq(profile.userId, followeeData.user!.id));

    const followerProfileResult = await db.select().from(profile).where(eq(profile.userId, followerData.user!.id));
    const followerProfile = followerProfileResult[0];

    const followeeProfileResult = await db.select().from(profile).where(eq(profile.userId, followeeData.user!.id));
    const followeeProfile = followeeProfileResult[0];
    followeeProfileId = followeeProfile.id;
    
    // Create follow relationship
    await db.insert(followRelationship).values({
      followerId: followerProfile.id,
      followeeId: followeeProfile.id
    });

    // Create posts on followee
    for (const followeePost of followeePosts) {
      await db.insert(post).values({
        authorId: followeeProfile.id,
        text: followeePost.text
      });
    }

    const insertedPosts = await db.select().from(post).where(eq(post.authorId, followeeProfile.id));

    for (const post of insertedPosts) {
      const comments = postCommentsMap[post.text];

      // Create comments on each post
      for (const newComment of comments) {
        await db.insert(comment).values({
          authorId: followerProfile.id,
          postId: post.id,
          content: newComment.content
        });
      }

      const likes = postLikesMap[post.text];

      // Have follower like posts where likes > 0
      if (likes > 0)
        await db.insert(likedPost).values({
          profileId: followerProfile.id,
          postId: post.id
        });
    }
  });

  test("gets feed", async () => {
    const { data: feedResult } = await testFetch("/api/feed", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Expect number of posts inserted from mock data above
    expect(feedResult?.length).toBe(2);

    for (const feedPost of feedResult!) {
      // Expect number of comments inserted from mock data above
      expect(feedPost.commentCount).toBe(postCommentsMap[feedPost.text].length);

      // Expect number of likes inserted from mock data above
      expect(feedPost.likes).toBe(postLikesMap[feedPost.text]);
    }
  });

  afterAll(async () => {
    const check = await db.select().from(profile).where(
      or(
        eq(profile.username, followee.username),
        eq(profile.username, follower.username)
      )
    );
    
    // Cleanup posts
    await db.delete(post).where(eq(post.authorId, followeeProfileId));

    // Remove relationship
    await db.delete(followRelationship).where(eq(followRelationship.followeeId, followeeProfileId));
    
    for (const user of check) {
      await db.delete(profile).where(eq(profile.id, user.id));
      await adminSupabase.auth.admin.deleteUser(user.userId!);
    }
  });
});