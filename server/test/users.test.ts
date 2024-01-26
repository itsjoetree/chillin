import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SignUpRequest } from "../models/SignUpRequest";
import { profile } from "../schema/profile";
import { eq, or, and } from "drizzle-orm";
import { adminSupabase, db, supabase, testFetch } from "./setup";
import { followRelationship } from "../schema/followRelationship";
import { alias } from "drizzle-orm/pg-core";

const follower: SignUpRequest = {
  email: "usertestfollower@chillin.tech",
  password: "testing123",
  username: "usertestfollower",
  nickname: "usertestfollower",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

const followee: SignUpRequest = {
  email: "usertestfollowee@chillin.tech",
  password: "testing123",
  username: "usertestfollowee",
  nickname: "usertestfollowee",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

let accessToken = "";

describe("users", () => {
  beforeAll(async () => {
    const { data: followerData } = await supabase.auth.signUp({
      email: follower.email,
      password: follower.password
    });

    const { data: followeeData } = await supabase.auth.signUp({
      email: followee.email,
      password: followee.password
    });
    
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

    accessToken = followerData.session!.access_token!;
  });

  test("follows user", async () => {
    await testFetch("/api/user/:username/follow", {
      params: {
        username: followee.username
      },
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const followerProfile = alias(profile, "followerProfile");
    const followeeProfile = alias(profile, "followeeProfile");

    const result = await db
    .select({
      followerId: followRelationship.followerId,
      followeeId: followRelationship.followeeId,
    })
    .from(followRelationship)
    .innerJoin(followeeProfile, eq(followRelationship.followeeId, followeeProfile.id))
    .innerJoin(followerProfile, eq(followRelationship.followerId, followerProfile.id))
    .where(and(
      eq(followerProfile.username, follower.username),
      eq(followeeProfile.username, followee.username)
    ));

    expect(result.length).toBe(1);
  });

  test("unfollows user", async () => {
    await testFetch("/api/user/:username/unfollow", {
      params: {
        username: followee.username
      },
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const followerProfile = alias(profile, "followerProfile");
    const followeeProfile = alias(profile, "followeeProfile");

    const result = await db
    .select({
      followerId: followRelationship.followerId,
      followeeId: followRelationship.followeeId,
    })
    .from(followRelationship)
    .innerJoin(followeeProfile, eq(followRelationship.followeeId, followeeProfile.id))
    .innerJoin(followerProfile, eq(followRelationship.followerId, followerProfile.id))
    .where(eq(followerProfile.username, follower.username) && eq(followeeProfile.username, followee.username));

    expect(result.length).toBe(0);
  });

  afterAll(async () => {
    const check = await db.select().from(profile).where(
      or(
        eq(profile.username, followee.username),
        eq(profile.username, follower.username)
      )
    );
    
    for (const user of check) {
      await db.delete(profile).where(eq(profile.id, user.id));
      await adminSupabase.auth.admin.deleteUser(user.userId!);
    }
  });
});