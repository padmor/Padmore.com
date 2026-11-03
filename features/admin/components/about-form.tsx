"use client";
import { useActionState } from "react";
import { Icon } from "@/components/icon";
import { ImageField } from "@/features/admin/components/image-field";
import type { AboutContent } from "@/modules/admin/collections";
import { saveAboutAction, type ContentFormState } from "@/modules/admin/content-actions";

const initialState: ContentFormState = {};

export function AboutForm({ about, saved }: { about: AboutContent; saved: boolean }) {
  const [state, action, pending] = useActionState(saveAboutAction, initialState);
  return <form className="form-card admin-form" action={action}>
    <div className="field"><label htmlFor="about-headline">Headline</label><input id="about-headline" name="headline" required maxLength={150} defaultValue={about.headline}/></div>
    <div className="field"><label htmlFor="about-intro">Introduction</label><textarea id="about-intro" name="intro" rows={2} required maxLength={400} defaultValue={about.intro}/></div>
    <div className="field"><label htmlFor="about-bio">Biography <small>Leave a blank line between paragraphs</small></label><textarea id="about-bio" name="bio" rows={9} required maxLength={5000} defaultValue={about.bio}/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="about-location">Location <small>Optional</small></label><input id="about-location" name="location" maxLength={100} defaultValue={about.location ?? ""}/></div>
      <div className="field"><label htmlFor="about-email">Contact email <small>Shown in the Contact me pop-up</small></label><input id="about-email" name="email" type="email" maxLength={254} placeholder="you@gmail.com" defaultValue={about.email ?? ""}/></div>
      <div className="field"><label htmlFor="about-phone">Phone <small>Optional, with country code</small></label><input id="about-phone" name="phone" type="tel" maxLength={20} placeholder="+233 20 000 0000" defaultValue={about.phone ?? ""}/></div>
      <div className="field"><label htmlFor="about-skills">Skills <small>Separate with commas</small></label><input id="about-skills" name="skills" maxLength={1000} defaultValue={about.skills.join(", ")}/></div>
      <div className="field"><label htmlFor="about-interests">Interests <small>Separate with commas</small></label><input id="about-interests" name="interests" maxLength={1000} placeholder="Football, music, design" defaultValue={(about.interests ?? []).join(", ")}/></div>
    </div>
    <div className="field"><label htmlFor="about-education">School and education <small>One per line, for example: University of Ghana · BSc Computer Science · 2022–2026</small></label><textarea id="about-education" name="education" rows={4} maxLength={2000} defaultValue={(about.education ?? []).join("\n")}/></div>
    <ImageField label="Profile image" currentId={about.photo_id}/>
    <ImageField name="hero_image" label="Another picture of you" currentId={about.hero_photo_id}/>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {saved && !state.error && !pending && <div className="inline-notice" role="status"><Icon name="check"/> Saved. Your home page, About and Profile pages are up to date.</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
