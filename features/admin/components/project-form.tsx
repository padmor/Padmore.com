"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ImageField } from "@/features/admin/components/image-field";
import { SelectWithOther } from "@/features/admin/components/select-with-other";
import { saveProjectAction, type ProjectFormState } from "@/modules/admin/actions";
import type { AdminProject } from "@/modules/admin/repository";
import { ARTWORK_OPTIONS, CATEGORY_OPTIONS, LIFECYCLE_OPTIONS, VISIBILITY_OPTIONS } from "@/modules/admin/validation";

const initialState: ProjectFormState = {};
const PROJECT_TYPE_OPTIONS: string[] = ["Web Application", "Mobile App", "Website", "Backend / API", "Design", "Developer Tool", "Open Source"];
const slugFrom = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function ProjectForm({ project }: { project?: AdminProject }) {
  const [state, action, pending] = useActionState(saveProjectAction.bind(null, project?.id ?? null), initialState);
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(project));
  const stack = project?.project_technologies.map((link) => link.technologies?.name).filter(Boolean).join(", ") ?? "";

  return <form className="form-card admin-form" action={action}>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="project-title">Title</label><input id="project-title" name="title" required maxLength={150} defaultValue={project?.title} onChange={(event) => { if (!slugEdited) setSlug(slugFrom(event.target.value)); }}/></div>
      <div className="field"><label htmlFor="project-slug">Web address</label><input id="project-slug" name="slug" required maxLength={120} value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value); }} aria-describedby="project-slug-note"/><small id="project-slug-note">Appears as /projects/{slug || "your-project"}</small></div>
    </div>
    <div className="field"><label htmlFor="project-summary">Short summary</label><textarea id="project-summary" name="summary" rows={2} required maxLength={400} defaultValue={project?.summary ?? ""}/></div>
    <div className="field"><label htmlFor="project-description">Full story <small>Optional</small></label><textarea id="project-description" name="description" rows={7} maxLength={20000} defaultValue={project?.description ?? ""}/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="project-type">Project type <small>Optional</small></label><SelectWithOther id="project-type" name="project_type" optional options={PROJECT_TYPE_OPTIONS.map((option) => [option, option] as const)} value={project?.project_type}/></div>
      <div className="field"><label htmlFor="project-category">Category</label><SelectWithOther id="project-category" name="category" options={CATEGORY_OPTIONS.map((option) => [option, option] as const)} value={project?.category}/></div>
      <div className="field"><label htmlFor="project-status">Project status</label><select id="project-status" name="lifecycle_status" defaultValue={project?.lifecycle_status ?? "in_progress"}>{LIFECYCLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="project-visibility">Who can see it</label><select id="project-visibility" name="visibility" defaultValue={project?.visibility ?? "draft"}>{VISIBILITY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="project-artwork">Card artwork</label><select id="project-artwork" name="artwork" defaultValue={project?.artwork ?? "portfolio"}>{ARTWORK_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="field"><label htmlFor="project-technologies">Technologies <small>Separate with commas</small></label><input id="project-technologies" name="technologies" maxLength={1000} placeholder="Next.js, PostgreSQL" defaultValue={stack}/></div>
      <div className="field"><label htmlFor="project-demo">Live demo link <small>Optional</small></label><input id="project-demo" name="demo_url" type="url" placeholder="https://" defaultValue={project?.demo_url ?? ""}/></div>
      <div className="field"><label htmlFor="project-repository">Source code link <small>Staff only</small></label><input id="project-repository" name="repository_url" type="url" placeholder="https://" defaultValue={project?.repository_url ?? ""}/></div>
      <div className="field"><label htmlFor="project-started">Started <small>Optional</small></label><input id="project-started" name="started_on" type="date" defaultValue={project?.started_on ?? ""}/></div>
      <div className="field"><label htmlFor="project-completed">Completed <small>Optional</small></label><input id="project-completed" name="completed_on" type="date" defaultValue={project?.completed_on ?? ""}/></div>
    </div>
    <ImageField label="Cover image" currentId={project?.image_id}/>
    <div className="admin-checks">
      <label><input type="checkbox" name="is_featured" defaultChecked={project?.is_featured}/> Feature on the home page</label>
      <label><input type="checkbox" name="is_tested" defaultChecked={project?.is_tested}/> Tested</label>
    </div>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : project ? "Save changes" : "Create project"}</button><Link className="button button-outline" href="/admin/projects">Cancel</Link></div>
  </form>;
}
