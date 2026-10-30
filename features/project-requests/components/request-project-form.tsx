"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
export function RequestProjectForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }
  return <form className="form-card" onSubmit={submit}>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="request-name">Your name <span>*</span></label><input id="request-name" name="name" placeholder="Full name" autoComplete="name" required/></div>
      <div className="field"><label htmlFor="request-email">Email address <span>*</span></label><input id="request-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required/></div>
    </div>
    <div className="field"><label htmlFor="request-org">Organization <small>Optional</small></label><input id="request-org" name="organization" placeholder="Company or organization" autoComplete="organization"/></div>
    <div className="field"><label htmlFor="request-title">Project title <span>*</span></label><input id="request-title" name="title" placeholder="e.g. Online booking application" required/></div>
    <label className="checkbox-field"><input type="checkbox" name="needs-guidance"/><span>I have an idea, but I need help defining what to build.</span></label>
    <div className="field"><label htmlFor="request-description">Project description <span>*</span></label><textarea id="request-description" name="description" rows={5} placeholder="What problem are you trying to solve? What would you like the software to do?" required minLength={20}/><small>Share as much detail as you can. You don't need to know the technical terms.</small></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="request-type">Project type <span>*</span></label><select id="request-type" name="type" required defaultValue=""><option value="" disabled>Select a type</option><option>Website</option><option>Web application</option><option>Mobile application</option><option>Business system</option><option>E-commerce</option><option>API or integration</option><option>Automation / AI</option><option>Not sure yet</option></select></div>
      <div className="field"><label htmlFor="request-budget">Budget range <small>Optional</small></label><select id="request-budget" name="budget" defaultValue=""><option value="">Choose a range</option><option>Under $500</option><option>$500–$1,500</option><option>$1,500–$5,000</option><option>$5,000+</option><option>Let's discuss</option></select></div>
      <div className="field"><label htmlFor="request-timeline">Preferred timeline</label><select id="request-timeline" name="timeline" defaultValue="Flexible"><option>Flexible</option><option>Within 2–4 weeks</option><option>Within 1–3 months</option><option>More than 3 months</option></select></div>
      <div className="field"><label htmlFor="request-reference">Reference link <small>Optional</small></label><input id="request-reference" name="reference" type="url" placeholder="https://"/></div>
    </div>
    <label className="checkbox-field"><input type="checkbox" required/><span>I understand this is a front-end preview and agree to be contacted about this enquiry.</span></label>
    <button className="button button-primary button-full" type="submit">Submit project request <Icon name="arrow" size={17}/></button>
    {sent && <FormNotice>Your form was validated in this preview. It has not been sent to a server; connect the backend before accepting real enquiries.</FormNotice>}
    <p className="form-footnote"><Icon name="shield-check" size={15}/> Your information should only be visible to authorized administrators once secure submission is connected.</p>
  </form>;
}
