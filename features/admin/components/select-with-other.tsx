"use client";
import { useState } from "react";

const OTHER = "__other__";

// A dropdown with an "Other…" choice. Only one of the two controls carries the
// field's name, so the form always submits a single value.
export function SelectWithOther({ id, name, options, value, optional }: { id: string; name: string; options: readonly (readonly [string, string])[]; value?: string | null; optional?: boolean }) {
  const listed = !value || options.some(([option]) => option === value);
  const [choice, setChoice] = useState(listed ? value || (optional ? "" : options[0]?.[0]) : OTHER);
  const typing = choice === OTHER;
  return <>
    <select id={id} name={typing ? undefined : name} value={choice} onChange={(event) => setChoice(event.target.value)}>
      {optional && <option value="">Not specified</option>}
      {options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
      <option value={OTHER}>Other…</option>
    </select>
    {typing && <input id={`${id}-other`} name={name} aria-label="Type your own" placeholder="Type your own" required={!optional} maxLength={80} defaultValue={listed ? "" : (value ?? "")} autoFocus/>}
  </>;
}
