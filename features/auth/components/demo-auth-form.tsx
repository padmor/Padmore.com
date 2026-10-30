"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
export function DemoAuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <form className="form-card auth-form" onSubmit={submit}>
    {mode === "signup" && <div className="field"><label htmlFor="auth-name">Full name</label><input id="auth-name" autoComplete="name" required placeholder="Your name"/></div>}
    <div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" required placeholder="you@example.com"/></div>
    <div className="field"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters"/></div>
    <button className="button button-primary button-full" type="submit">{mode === "signin" ? "Sign in" : "Create account"} <Icon name="arrow" size={16}/></button>
    {sent && <div className="inline-notice" role="status"><Icon name="info"/> Authentication is a visual preview only. Connect Supabase Auth before using real accounts. No password has been stored or transmitted.</div>}
  </form>;
}
