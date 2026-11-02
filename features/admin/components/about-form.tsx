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
      <div className="field"><label htmlFor="about-skills">Skills <small>Separate with commas</small></label><input id="about-skills" name="skills" maxLength={1000} defaultValue={about.skills.join(", ")}/></div>
    </div>
    <ImageField label="Profile image" currentId={about.photo_id}/>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {saved && !state.error && !pending && <div className="inline-notice" role="status"><Icon name="check"/> Saved. The About and Profile pages are up to date.</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
