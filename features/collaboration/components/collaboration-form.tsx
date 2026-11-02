"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
import { submitCollaborationAction, type PublicFormState } from "@/modules/inquiries/actions";
import { Honeypot } from "@/features/contact/components/honeypot";

const initialState: PublicFormState = {};

export function CollaborationForm({ opportunities }: { opportunities: string[] }) {
  const [state, action, pending] = useActionState(submitCollaborationAction, initialState);
  return <form className="form-card" action={action}>
    <Honeypot/>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-name">Your name <span>*</span></label><input id="collab-name" name="name" placeholder="Full name" required maxLength={200}/></div>
      <div className="field"><label htmlFor="collab-email">Email address <span>*</span></label><input id="collab-email" name="email" type="email" placeholder="you@example.com" required/></div>
    </div>
    <div className="field"><label htmlFor="collab-opportunity">Opportunity you are interested in</label><select id="collab-opportunity" name="opportunity" defaultValue="General collaboration"><option>General collaboration</option>{opportunities.map((title) => <option key={title}>{title}</option>)}</select></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-role">Your role <span>*</span></label><select id="collab-role" name="role" required defaultValue=""><option value="" disabled>Select your role</option><option>Frontend developer</option><option>Backend developer</option><option>Mobile developer</option><option>UI/UX designer</option><option>QA / tester</option><option>Product / project manager</option><option>Other</option></select></div>
      <div className="field"><label htmlFor="collab-availability">Availability</label><select id="collab-availability" name="availability" defaultValue="Flexible"><option>Flexible</option><option>Part-time</option><option>Full-time</option><option>Project-based</option></select></div>
    </div>
    <div className="field"><label htmlFor="collab-skills">Skills and technologies <span>*</span></label><input id="collab-skills" name="skills" placeholder="e.g. React, Figma, Node.js" required maxLength={1000}/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-portfolio">Portfolio URL</label><input id="collab-portfolio" name="portfolio" type="url" placeholder="https://"/></div>
      <div className="field"><label htmlFor="collab-github">GitHub URL</label><input id="collab-github" name="github" type="url" placeholder="https://github.com/..."/></div>
    </div>
    <div className="field"><label htmlFor="collab-motivation">What would you like to contribute? <span>*</span></label><textarea id="collab-motivation" name="motivation" rows={4} placeholder="Tell me what you'd enjoy building together..." required minLength={20} maxLength={9000}/></div>
    <label className="checkbox-field"><input type="checkbox" required/><span>I understand this is an expression of interest, not a confirmed role.</span></label>
    <button className="button button-primary button-full" type="submit" disabled={pending}>{pending ? "Sending…" : "Send collaboration application"}</button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.sent && <FormNotice>Thanks, your application has been received. I'll reply by email.</FormNotice>}
  </form>;
}
