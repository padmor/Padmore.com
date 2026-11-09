"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ImageField } from "@/features/admin/components/image-field";
import { SelectWithOther } from "@/features/admin/components/select-with-other";
import { COLLECTIONS, type CollectionKey, type Field } from "@/modules/admin/collections";
import { deleteContentAction, saveContentAction, type ContentFormState } from "@/modules/admin/content-actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: ContentFormState = {};
const slugFrom = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const text = (value: unknown) => (value === null || value === undefined ? "" : String(value));

function Input({ field, value, onTitle }: { field: Field; value: unknown; onTitle?: (title: string) => void }) {
  const id = `content-${field.name}`;
  const shared = { id, name: field.name, required: field.required, maxLength: field.max, placeholder: field.placeholder };
  const label = <label htmlFor={id}>{field.label}{field.optional && <small> Optional</small>}</label>;
  const note = field.note && <small>{field.note}</small>;
  const wide = field.kind === "textarea" ? "field admin-field-wide" : "field";

  if (field.kind === "textarea") return <div className={wide}>{label}<textarea {...shared} rows={field.rows} defaultValue={text(value)}/>{note}</div>;
  if (field.kind === "select" && field.other) return <div className={wide}>{label}<SelectWithOther id={id} name={field.name} options={field.options ?? []} optional={field.optional} value={text(value)}/></div>;
  if (field.kind === "select") {
    // A saved value that is no longer in the list stays selectable, so editing never loses it.
    const current = text(value);
    const options = [...(field.optional ? [["", "Not specified"] as const] : []), ...(field.options ?? [])];
    if (current && !options.some(([option]) => option === current)) options.push([current, current]);
    return <div className={wide}>{label}<select id={id} name={field.name} defaultValue={current || options[0]?.[0]}>{options.map(([option, name]) => <option key={option} value={option}>{name}</option>)}</select></div>;
  }
  if (field.kind === "number") return <div className={wide}>{label}<input id={id} name={field.name} required={field.required} type="number" min="0" step="any" defaultValue={text(value)}/>{note}</div>;
  if (field.kind === "url" || field.kind === "date") return <div className={wide}>{label}<input {...shared} type={field.kind} defaultValue={text(value)}/>{note}</div>;
  return <div className={wide}>{label}<input {...shared} defaultValue={text(value)} onChange={field.name === "title" && onTitle ? (event) => onTitle(event.target.value) : undefined}/>{note}</div>;
}

export function ContentForm({ collection, id, values = {} }: { collection: CollectionKey; id?: string; values?: Record<string, unknown> }) {
  const { fields, singular } = COLLECTIONS[collection];
  const [state, action, pending] = useActionState(saveContentAction.bind(null, collection, id ?? null), initialState);
  const [slug, setSlug] = useState(text(values.slug));
  const [slugEdited, setSlugEdited] = useState(Boolean(id));
  const inputs = fields as readonly Field[];

  return <form className="form-card admin-form" action={action}>
    <div className="form-grid two-col">
      {inputs.filter((field) => field.kind !== "checkbox").map((field) => field.kind === "image"
        ? <ImageField key={field.name} label={field.label} currentId={text(values.image_id) || null}/>
        : field.kind === "slug"
        ?<div className="field" key={field.name}><label htmlFor="content-slug">{field.label}</label><input id="content-slug" name="slug" required maxLength={field.max} value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value); }}/></div>
        : <Input key={field.name} field={field} value={values[field.name]} onTitle={(title) => { if (!slugEdited) setSlug(slugFrom(title)); }}/>)}
    </div>
    <div className="admin-checks">{inputs.filter((field) => field.kind === "checkbox").map((field) => <label key={field.name}><input type="checkbox" name={field.name} defaultChecked={Boolean(values[field.name])}/> {field.label}</label>)}</div>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Saving…" : id ? "Save changes" : `Create ${singular}`}</button><Link className="button button-outline" href={`/admin/${collection}`}>Cancel</Link></div>
  </form>;
}

export function DeleteContentButton({ collection, id, title }: { collection: CollectionKey; id: string; title: string }) {
  return <form action={deleteContentAction.bind(null, collection, id)} onSubmit={(event) => { if (!window.confirm(`Delete "${title}" permanently? This can't be undone.`)) event.preventDefault(); }}>
    <SubmitButton className="button button-outline button-small admin-danger" type="submit">Delete</SubmitButton>
  </form>;
}
