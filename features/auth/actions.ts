"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AUTH_ACCOUNT_LIMIT, AUTH_IP_LIMIT, clientIp, consumeRateLimit } from "@/lib/security/rate-limit";
import { env } from "@/lib/environment/server";
import { returnPathOrDefault } from "@/lib/auth/return-path";
import { recordEngagementEvent } from "@/modules/analytics/engagement";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "./validation";

export type AuthState = { error?: string; notice?: string };

const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

async function withinLimits(email: string) {
  const [byIp, byAccount] = await Promise.all([
    consumeRateLimit(AUTH_IP_LIMIT, await clientIp()),
    consumeRateLimit(AUTH_ACCOUNT_LIMIT, email),
  ]);
  return byIp && byAccount;
}

export async function signInAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address and password." };
  if (!(await withinLimits(parsed.data.email))) return { error: TOO_MANY };

  const { error } = await auth.signIn.email(parsed.data);
  // The same message either way, so the form does not reveal which emails exist.
  if (error) return { error: "That email and password didn't match." };

  // Back to the page the person came from, but only a plain path on this site (see return-path.ts).
  // With none, they go to the dashboard.
  redirect(returnPathOrDefault(formData.get("next")));
}

export async function signUpAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  if (!(await withinLimits(parsed.data.email))) return { error: TOO_MANY };

  const { data, error } = await auth.signUp.email(parsed.data);
  if (error) return { error: "We couldn't create that account. Check your details or try signing in." };
  await recordEngagementEvent("signup_completed", "/signup");
  if (!data?.token) return { notice: "Check your email to confirm your account, then sign in." };

  redirect(returnPathOrDefault(formData.get("next")));
}

export async function requestPasswordResetAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!(await withinLimits(parsed.data.email))) return { error: TOO_MANY };

  // The link's address comes from configuration, never the request's Host header,
  // so a forged request cannot point a reset email at another site.
  await auth.requestPasswordReset({ email: parsed.data.email, redirectTo: `${env.APP_URL}/reset-password` });

  // The same message either way, so the form does not reveal which emails exist.
  return { notice: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your new password and try again." };
  if (!(await consumeRateLimit(AUTH_IP_LIMIT, await clientIp()))) return { error: TOO_MANY };

  const { error } = await auth.resetPassword({ newPassword: parsed.data.password, token: parsed.data.token });
  if (error) return { error: "This reset link is invalid or has expired." };

  redirect("/signin");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/");
}
