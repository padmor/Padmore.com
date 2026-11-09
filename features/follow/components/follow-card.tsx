import type { ReactNode } from "react";
import { FollowButton } from "./follow-button";

// The one "what next?" card at the end of a tutorial or project. It offers Follow, and
// optionally one more action beside it. Nothing here interrupts reading: it sits at the end.
export function FollowCard({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <section data-tw aria-labelledby="follow-card-heading" className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
    <h2 id="follow-card-heading" className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
    <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-soft-foreground">{text}</p>
    <div className="mt-5 flex flex-wrap items-center gap-4"><FollowButton/>{action}</div>
  </section>;
}
