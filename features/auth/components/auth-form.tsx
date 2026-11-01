"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { signInAction, signUpAction, type AuthState } from "@/features/auth/actions";

const initialState: AuthState = {};

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [state, action, pending] = useActionState(mode === "signin" ? signInAction : signUpAction, initialState);
  return <form className="form-card auth-form" action={action}>
    {mode === "signup" && <div className="field"><label htmlFor="auth-name">Full name</label><input id="auth-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name"/></div>}
    <div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={320} placeholder="you@example.com"/></div>
    <div className="field"><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} maxLength={128} required placeholder="At least 8 characters"/></div>
    <button className="button button-primary button-full" type="submit" disabled={pending}>{pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"} <Icon name="arrow" size={16}/></button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.notice && <div className="inline-notice" role="status"><Icon name="info"/> {state.notice}</div>}
  </form>;
}
