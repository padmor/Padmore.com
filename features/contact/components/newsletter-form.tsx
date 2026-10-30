"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }
  return <form className={`newsletter-form${compact ? " compact" : ""}`} onSubmit={submit}>
    <label className="sr-only" htmlFor={compact ? "footer-email" : "newsletter-email"}>Email address</label>
    <div className="inline-form"><input id={compact ? "footer-email" : "newsletter-email"} type="email" placeholder="Your email address" required/><button type="submit" className="button button-primary" aria-label="Subscribe"><Icon name="arrow" size={17}/></button></div>
    {sent && <FormNotice>Thanks! This is a front-end preview; email subscriptions will activate after backend setup.</FormNotice>}
  </form>;
}
