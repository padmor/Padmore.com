"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
import { submitContactAction, type PublicFormState } from "@/modules/inquiries/actions";
import { Honeypot } from "@/features/contact/components/honeypot";

const initialState: PublicFormState = {};

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initialState);
  return <form className="form-card" action={action}>
    <Honeypot/>
    <div className="form-grid two-col"><div className="field"><label htmlFor="contact-name">Name <span>*</span></label><input id="contact-name" name="name" required maxLength={200} placeholder="Your name"/></div><div className="field"><label htmlFor="contact-email">Email <span>*</span></label><input id="contact-email" name="email" required type="email" placeholder="you@example.com"/></div></div>
    <div className="field"><label htmlFor="contact-subject">Subject</label><select id="contact-subject" name="subject" defaultValue="General enquiry"><option>General enquiry</option><option>Project request</option><option>Collaboration</option><option>Product support</option></select></div>
    <div className="field"><label htmlFor="contact-message">Message <span>*</span></label><textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={10000} placeholder="How can I help?"/></div>
    <button className="button button-primary button-full" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Sending…" : "Send message"} <Icon name="send" size={16}/></button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.sent && <FormNotice>Thanks, your message has been received. I'll reply by email.</FormNotice>}
  </form>;
}
