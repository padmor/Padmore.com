"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
import { submitProjectRequestAction, type PublicFormState } from "@/modules/inquiries/actions";
import { Honeypot } from "@/features/contact/components/honeypot";

const initialState: PublicFormState = {};

export function RequestProjectForm() {
  const [state, action, pending] = useActionState(submitProjectRequestAction, initialState);
  return <form className="form-card" action={action}>
    <Honeypot/>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="request-name">Your name <span>*</span></label><input id="request-name" name="name" placeholder="Full name" autoComplete="name" required maxLength={200}/></div>
      <div className="field"><label htmlFor="request-email">Email address <span>*</span></label><input id="request-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required/></div>
    </div>
    <div className="field"><label htmlFor="request-org">Organization <small>Optional</small></label><input id="request-org" name="organization" placeholder="Company or organization" autoComplete="organization" maxLength={200}/></div>
    <div className="field"><label htmlFor="request-title">Project title <span>*</span></label><input id="request-title" name="title" placeholder="e.g. Online booking application" required maxLength={300}/></div>
    <label className="checkbox-field"><input type="checkbox" name="guidance"/><span>I have an idea, but I need help defining what to build.</span></label>
    <div className="field"><label htmlFor="request-description">Project description <span>*</span></label><textarea id="request-description" name="description" rows={5} placeholder="What problem are you trying to solve? What would you like the software to do?" required minLength={20} maxLength={9000}/><small>Share as much detail as you can. You don't need to know the technical terms.</small></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="request-type">Project type <span>*</span></label><select id="request-type" name="type" required defaultValue=""><option value="" disabled>Select a type</option><option>Website</option><option>Web application</option><option>Mobile application</option><option>Business system</option><option>E-commerce</option><option>API or integration</option><option>Automation / AI</option><option>Not sure yet</option></select></div>
      <div className="field"><label htmlFor="request-budget">Budget range <small>Optional</small></label><select id="request-budget" name="budget" defaultValue=""><option value="">Choose a range</option><option>Under GHS 5,000</option><option>GHS 5,000–15,000</option><option>GHS 15,000–50,000</option><option>GHS 50,000+</option><option>Let's discuss</option></select></div>
      <div className="field"><label htmlFor="request-timeline">Preferred timeline</label><select id="request-timeline" name="timeline" defaultValue="Flexible"><option>Flexible</option><option>Within 2–4 weeks</option><option>Within 1–3 months</option><option>More than 3 months</option></select></div>
      <div className="field"><label htmlFor="request-reference">Reference link <small>Optional</small></label><input id="request-reference" name="reference" type="url" placeholder="https://"/></div>
    </div>
    <label className="checkbox-field"><input type="checkbox" required/><span>I agree to be contacted about this enquiry.</span></label>
    <button className="button button-primary button-full" type="submit" disabled={pending}>{pending ? "Sending…" : "Submit project request"} <Icon name="arrow" size={17}/></button>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.sent && <FormNotice>Thanks, your project request has been received. I'll reply by email.</FormNotice>}
    <p className="form-footnote"><Icon name="shield-check" size={15}/> Your details are only visible to authorized staff.</p>
  </form>;
}
