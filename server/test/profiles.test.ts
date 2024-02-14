import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SignUpRequest } from "../models/signUpRequest";
import { ProfileRequestBody, profile } from "../schema/profile";
import { eq } from "drizzle-orm";
import { adminSupabase, db, supabase, testFetch } from "./setup";

const profileSignUp: SignUpRequest = {
  email: "profiletest@chillin.tech",
  password: "testing123",
  username: "profiletest",
  nickname: "profiletest",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

let accessToken = "";
let user_id = "";

describe("profile", () => {
  beforeAll(async () => {
    const { data } = await supabase.auth.signUp({
      email: profileSignUp.email,
      password: profileSignUp.password
    });

    await db.update(profile)
      .set({
        username: profileSignUp.username,
        nickname: profileSignUp.nickname,
        siteVariant: profileSignUp.siteVariant,
        birthday: profileSignUp.birthday
      })
      .where(eq(profile.userId, data.user!.id));

    accessToken = data.session!.access_token!;
    user_id = data.user!.id!;
  });

  test("gets profile", async () => {
    const res = await testFetch("/api/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    expect(res.data?.username).toBe(profileSignUp.username);
    expect(res.data?.nickname).toBe(profileSignUp.nickname!);
    expect(res.data?.siteVariant).toBe(profileSignUp.siteVariant);
  });

  test("updates profile", async () => {
    const updatePayload: ProfileRequestBody = {
      username: "newProfileUsername",
      nickname: "newProfileNickname",
      siteVariant: "cool"
    };

    const updateRes = await testFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  
    expect(updateRes.data?.username).toBe(updatePayload.username!);
    expect(updateRes.data?.nickname).toBe(updatePayload.nickname!);
    expect(updateRes.data?.siteVariant).toBe(updatePayload.siteVariant!);
  });

  afterAll(async () => {
    const check = await db.select().from(profile).where(eq(profile.userId, user_id));
    const checkUser = check[0];

    if (checkUser.userId) {
      await db.delete(profile).where(eq(profile.userId, checkUser.userId));
      await adminSupabase.auth.admin.deleteUser(checkUser.userId);
    }
  });
});