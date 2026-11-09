"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPostAction, type CommunityFormState } from "@/modules/community/actions";

const TITLE_MAX = 150;
const BODY_MAX = 2000;
const initial: CommunityFormState = {};

const field = "w-full rounded-xl border border-border-strong bg-background/70 text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25";

// Collapsed it is a single "Create a post" bar. Pressing it opens the form.
export function CommunityComposer({ name }: { name: string }) {
  const [state, action, pending] = useActionState(createPostAction, initial);
  const [open, setOpen] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [bodyLength, setBodyLength] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  // A successful post closes the form and empties it for next time.
  useEffect(() => {
    if (!state.sent) return;
    form.current?.reset();
    setTitleLength(0);
    setBodyLength(0);
    setOpen(false);
  }, [state.sent]);

  const initialLetter = name.slice(0, 1).toUpperCase();

  if (!open) return <button type="button" onClick={() => setOpen(true)} id="community-composer"
    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/80 p-3 text-left shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{initialLetter}</span>
    <span className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">Create a post</span>
    <PenLine className="mr-1 size-5 text-muted-foreground" aria-hidden="true"/>
  </button>;

  return <form ref={form} action={action} className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm sm:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
    <h2 className="m-0 mb-3 font-display text-base font-semibold tracking-[-0.02em] text-foreground">Create a post</h2>
    <div className="grid gap-3">
      <div>
        <label htmlFor="community-title" className="sr-only">Title</label>
        <input id="community-title" name="title" required maxLength={TITLE_MAX} autoFocus onChange={(event) => setTitleLength(event.target.value.length)} placeholder="Title" className={`${field} h-11 px-4 text-[15px] font-semibold`}/>
        <p className="mt-1 text-right text-xs text-muted-foreground tabular-nums">{titleLength} / {TITLE_MAX}</p>
      </div>
      <div>
        <label htmlFor="community-body" className="sr-only">Details</label>
        <textarea id="community-body" name="body" required maxLength={BODY_MAX} rows={5} onChange={(event) => setBodyLength(event.target.value.length)} placeholder="Share the details, a question or an idea." className={`${field} min-h-32 resize-y p-4 text-[15px] leading-relaxed`}/>
        <p className={`mt-1 text-right text-xs tabular-nums ${bodyLength > BODY_MAX - 100 ? "font-semibold text-warning" : "text-muted-foreground"}`} aria-live="polite">{bodyLength.toLocaleString()} / {BODY_MAX.toLocaleString()}</p>
      </div>
    </div>
    {state.error && <p role="alert" className="mt-2 rounded-xl bg-warning-soft px-3.5 py-2.5 text-sm font-medium text-warning">{state.error}</p>}
    <div className="mt-3 flex items-center justify-end gap-2">
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button type="submit" disabled={pending || titleLength === 0 || bodyLength === 0} aria-busy={pending}>{pending ? "Posting…" : "Post"}</Button>
    </div>
  </form>;
}
