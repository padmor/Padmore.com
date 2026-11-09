"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { requestPasswordResetAction, resetPasswordAction, type AuthState } from "@/features/auth/actions";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);
  return <form className="form-card auth-form" action={action}>
    <div className="field"><label htmlFor="reset-email">Email address</label><input id="reset-email" name="email" type="email" autoComplete="email" required maxLength={320} placeholder="you@example.com"/></div>
    <button className="button button-primary button-full" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Please wait…" : "Send reset link"} <Icon name="arrow" size={16}/></button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.notice && <div className="inline-notice" role="status"><Icon name="info"/> {state.notice}</div>}
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);
  return <form className="form-card auth-form" action={action}>
    <input type="hidden" name="token" value={token}/>
    <div className="field"><label htmlFor="reset-password">New password</label><input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required placeholder="At least 8 characters"/></div>
    <button className="button button-primary button-full" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Please wait…" : "Set new password"} <Icon name="arrow" size={16}/></button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error} <Link href="/forgot-password">Request a new link</Link></div>}
  </form>;
}
