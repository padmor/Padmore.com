"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }
  return <form className="form-card" onSubmit={submit}>
    <div className="form-grid two-col"><div className="field"><label htmlFor="contact-name">Name <span>*</span></label><input id="contact-name" required placeholder="Your name"/></div><div className="field"><label htmlFor="contact-email">Email <span>*</span></label><input id="contact-email" required type="email" placeholder="you@example.com"/></div></div>
    <div className="field"><label htmlFor="contact-subject">Subject</label><select id="contact-subject" defaultValue="General enquiry"><option>General enquiry</option><option>Project request</option><option>Collaboration</option><option>Product support</option></select></div>
    <div className="field"><label htmlFor="contact-message">Message <span>*</span></label><textarea id="contact-message" rows={5} required minLength={10} placeholder="How can I help?"/></div>
    <button className="button button-primary button-full" type="submit">Send message <Icon name="send" size={16}/></button>
    {sent && <FormNotice>Message form validated in preview mode. It has not been transmitted.</FormNotice>}
  </form>;
}
