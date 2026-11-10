import type { ReactNode } from "react";
import { Bookmark, Bell, BookOpen } from "lucide-react";
import { FollowButton } from "./follow-button";

export function FollowCard({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <section data-tw aria-labelledby="follow-card-heading" className="follow-engagement-card">
      <div className="follow-engagement-copy">
        <span className="eyebrow">STAY CONNECTED</span>
        <h2 id="follow-card-heading">{title}</h2>
        <p>{text}</p>
        <div className="follow-engagement-actions"><FollowButton/>{action}</div>
      </div>
      <div className="follow-engagement-benefits" aria-label="Member benefits">
        <div><span><Bookmark aria-hidden="true"/></span><small>Save useful projects and lessons</small></div>
        <div><span><BookOpen aria-hidden="true"/></span><small>Keep learning with new tutorials</small></div>
        <div><span><Bell aria-hidden="true"/></span><small>See new work in your dashboard</small></div>
      </div>
    </section>
  );
}
