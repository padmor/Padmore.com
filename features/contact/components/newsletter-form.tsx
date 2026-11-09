"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
import { subscribeAction, type PublicFormState } from "@/modules/inquiries/actions";
import { Honeypot } from "@/features/contact/components/honeypot";

const initialState: PublicFormState = {};

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(subscribeAction, initialState);
  return <form className={`newsletter-form${compact ? " compact" : ""}`} action={action}>
    <Honeypot/>
    <label className="sr-only" htmlFor={compact ? "footer-email" : "newsletter-email"}>Email address</label>
    <div className="inline-form"><input id={compact ? "footer-email" : "newsletter-email"} name="email" type="email" placeholder="Your email address" required/><button type="submit" className="button button-primary" aria-label="Subscribe" disabled={pending} aria-busy={pending}><Icon name="arrow" size={17}/></button></div>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.sent && <FormNotice>Thanks for subscribing!</FormNotice>}
  </form>;
}
