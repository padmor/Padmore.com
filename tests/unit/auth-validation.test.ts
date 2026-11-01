import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/features/auth/validation";

describe("auth input", () => {
  it("normalizes email", () => {
    expect(signInSchema.parse({ email: "  Me@Example.COM ", password: "x" }).email).toBe("me@example.com");
  });
  it("rejects malformed email", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
  it("rejects short and oversized passwords on sign-up", () => {
    const base = { name: "A", email: "a@example.com" };
    expect(signUpSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, password: "x".repeat(129) }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, password: "long-enough" }).success).toBe(true);
  });
  it("drops unexpected fields such as a role", () => {
    const parsed = signUpSchema.parse({ name: "A", email: "a@example.com", password: "long-enough", role: "owner" });
    expect(parsed).not.toHaveProperty("role");
  });
});

describe("password recovery input", () => {
  it("requires a real email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
  it("requires a token and a strong enough password", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "long-enough" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "long-enough" }).success).toBe(true);
  });
});
