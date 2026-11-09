"use client";
import { Download, Eye, Lock } from "lucide-react";
import { useAuthPrompt } from "@/features/community/components/auth-prompt";
import { useMemberState } from "@/features/projects/components/bookmark-button";

const button = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-strong bg-card px-3 text-[13px] font-semibold text-foreground transition hover:border-muted-foreground/40 hover:bg-muted";

// Reading, watching and listening are free. Documents and images need a free account, and the
// server enforces that too, so these buttons only decide what to show. Until we know whether the
// visitor is signed in, the links show as usual.
export function DocumentActions({ id, title, canView }: { id: string; title: string; canView: boolean }) {
  const { ready, signedIn } = useMemberState();
  const ask = useAuthPrompt();
  if (ready && !signedIn) return <button type="button" className={button} onClick={() => ask("download this file")}><Lock className="size-4"/>Sign in to download</button>;
  return <span className="flex gap-2">
    {canView && <a className={button} href={`/tutorial-files/${id}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${title}`}><Eye className="size-4"/>View</a>}
    <a className={button} href={`/tutorial-files/${id}?download=1`} aria-label={`Download ${title}`}><Download className="size-4"/>Download</a>
  </span>;
}

export function GatedImage({ id, title }: { id: string; title: string }) {
  const { ready, signedIn } = useMemberState();
  const ask = useAuthPrompt();
  if (!ready) return <span className="block aspect-[4/3] rounded-2xl border border-border bg-muted"/>;
  if (!signedIn) return <button type="button" onClick={() => ask("view this image")} aria-label={`Sign in to view ${title}`} className="grid aspect-[4/3] w-full place-items-center rounded-2xl border border-border bg-muted text-sm font-semibold text-muted-foreground transition hover:border-muted-foreground/40">
    <span className="grid justify-items-center gap-1.5"><Lock className="size-5"/>Sign in to view</span>
  </button>;
  return <a href={`/tutorial-files/${id}`} target="_blank" rel="noopener noreferrer" aria-label={`Open image: ${title}`} className="group block overflow-hidden rounded-2xl border border-border">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/tutorial-files/${id}`} alt={title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"/>
  </a>;
}
