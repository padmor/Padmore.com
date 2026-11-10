import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, Sparkles } from "lucide-react";
import { FollowButton } from "@/features/follow/components/follow-button";

export function HomeFollowCard() {
  return (
    <section className="home-follow-card" aria-labelledby="home-follow-title">
      <div className="home-follow-copy">
        <span className="home-follow-eyebrow"><Sparkles aria-hidden="true"/> STAY CONNECTED</span>
        <h2 id="home-follow-title">Enjoying what you see?</h2>
        <p>Follow my work to keep up with new projects, practical tutorials and updates. Create a free account to save things you want to revisit.</p>
        <div className="home-follow-actions">
          <FollowButton/>
          <Link href="/tutorials" className="home-follow-secondary">Explore tutorials <ArrowRight aria-hidden="true"/></Link>
        </div>
      </div>
      <div className="home-follow-benefits" aria-label="Member benefits">
        <div><span><Bookmark aria-hidden="true"/></span><strong>Save useful work</strong><small>Keep projects and lessons in one place.</small></div>
        <div><span><BookOpen aria-hidden="true"/></span><strong>Keep learning</strong><small>Find your next tutorial when you return.</small></div>
      </div>
    </section>
  );
}
