import { afterAll, describe, expect, it } from "bun:test";
import { SignUpRequest } from "../models/signUpRequest";
import { profile } from "../schema/profile";
import { eq } from "drizzle-orm";
import { SignInRequest } from "../models/signInRequest";
import { adminSupabase, db, testFetch } from "./setup";

const authSignUp: SignUpRequest = {
  email: "authtest@chillin.tech",
  password: "testing123",
  username: "authtest",
  nickname: "authtest",
  birthday: new Date().toLocaleDateString(),
  siteVariant: "chillin"
};

describe("auth", () => {
  it("returns tokens on sign up", async () => {
    const res = await testFetch("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(authSignUp)
    });

    expect(res.data?.access_token).toBeDefined();
    expect(res.data?.refresh_token).toBeDefined();
  });

  it("returns tokens on sign in", async () => {
    const data: SignInRequest = {
      email: authSignUp.email,
      password: authSignUp.password
    };  

    const res = await testFetch("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(data)
    });

    expect(res.data?.access_token).toBeDefined();
    expect(res.data?.refresh_token).toBeDefined();
  });

  afterAll(async () => {
    const check = await db.select().from(profile).where(eq(profile.username, authSignUp.username));
    const checkUser = check[0];

    if (checkUser.userId) {
      await db.delete(profile).where(eq(profile.userId, checkUser.userId));
      await adminSupabase.auth.admin.deleteUser(checkUser.userId);
    }
  });
});