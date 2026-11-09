"use client";
import { PenLine } from "lucide-react";
import { useSignInRedirect } from "./auth-prompt";

// Looks exactly like the member's "Create a post" bar, so the page reads the same
// for everyone. Pressing it is what asks a visitor to sign in.
export function GuestComposer() {
  const ask = useSignInRedirect();
  return <button type="button" onClick={() => ask("create a post")} id="community-composer"
    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/80 p-3 text-left shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">?</span>
    <span className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">Create a post</span>
    <PenLine className="mr-1 size-5 text-muted-foreground" aria-hidden="true"/>
  </button>;
}
