"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { FormNotice } from "@/components/form-notice";
export function CollaborationForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }
  return <form className="form-card" onSubmit={submit}>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-name">Your name <span>*</span></label><input id="collab-name" name="name" placeholder="Full name" required/></div>
      <div className="field"><label htmlFor="collab-email">Email address <span>*</span></label><input id="collab-email" name="email" type="email" placeholder="you@example.com" required/></div>
    </div>
    <div className="field"><label htmlFor="collab-opportunity">Opportunity you are interested in</label><select id="collab-opportunity" defaultValue="General collaboration"><option>General collaboration</option><option>Mobile App Developer</option><option>UI/UX Designer</option><option>Backend Developer</option><option>Frontend Developer</option><option>QA / Tester</option></select></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-role">Your role <span>*</span></label><select id="collab-role" required defaultValue=""><option value="" disabled>Select your role</option><option>Frontend developer</option><option>Backend developer</option><option>Mobile developer</option><option>UI/UX designer</option><option>QA / tester</option><option>Product / project manager</option><option>Other</option></select></div>
      <div className="field"><label htmlFor="collab-availability">Availability</label><select id="collab-availability" defaultValue="Flexible"><option>Flexible</option><option>Part-time</option><option>Full-time</option><option>Project-based</option></select></div>
    </div>
    <div className="field"><label htmlFor="collab-skills">Skills and technologies <span>*</span></label><input id="collab-skills" placeholder="e.g. React, Figma, Node.js" required/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="collab-portfolio">Portfolio URL</label><input id="collab-portfolio" type="url" placeholder="https://"/></div>
      <div className="field"><label htmlFor="collab-github">GitHub URL</label><input id="collab-github" type="url" placeholder="https://github.com/..."/></div>
    </div>
    <div className="field"><label htmlFor="collab-motivation">What would you like to contribute? <span>*</span></label><textarea id="collab-motivation" rows={4} placeholder="Tell me what you'd enjoy building together..." required minLength={20}/></div>
    <label className="checkbox-field"><input type="checkbox" required/><span>I understand this is an expression of interest, not a confirmed role.</span></label>
    <button className="button button-primary button-full" type="submit">Send collaboration application <Icon name="arrow" size={17}/></button>
    {sent && <FormNotice>Your application form passed preview validation. Backend submission is not connected yet.</FormNotice>}
  </form>;
}
