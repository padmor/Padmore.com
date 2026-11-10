import Link from "next/link";
import { Check } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { requireUser } from "@/lib/auth/session";
import { signOutAction } from "@/features/auth/actions";
import { FollowButton } from "@/features/follow/components/follow-button";
import { getFollowedSince, listFollowFeed, type FeedItem } from "@/modules/follow/feed";
import { listSavedItems, type SavedItem } from "@/modules/saved/repository";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Member dashboard" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = { project: "Project", tutorial: "Tutorial", update: "Update" };
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function MemberDashboardPage() {
  const user = await requireUser();
  const [saved, followedSince] = await Promise.all([
    listSavedItems(user.id).catch((): SavedItem[] => []),
    getFollowedSince(user.id).catch(() => null),
  ]);
  const feed: FeedItem[] = followedSince ? await listFollowFeed(followedSince).catch((): FeedItem[] => []) : [];

  const steps = [
    { done: Boolean(followedSince), label: "Follow to see new tutorials and projects here", href: "/about" },
    { done: saved.length > 0, label: "Save a tutorial or project", href: "/tutorials" },
    { done: false, label: "Say hello in the community", href: "/community" },
  ];
  const stats = [
    { label: "Saved items", value: String(saved.length), icon: "bookmark" as const },
    { label: "Following", value: followedSince ? "Yes" : "No", icon: "users" as const },
    { label: "Orders", value: "—", icon: "store" as const },
    { label: "Requests", value: "—", icon: "briefcase" as const },
  ];

  return (
    <section className="page-container content-page member-home">
      <PageIntro
        eyebrow="MY ACCOUNT"
        title={`Welcome back, ${user.name}`}
        description="Your saved items, followed updates and account activity in one place."
        action={<form action={signOutAction}><SubmitButton className="button button-outline button-small" type="submit">Sign out</SubmitButton></form>}
      />

      <div className="member-dashboard-grid">
        <aside className="dashboard-nav" aria-label="Member navigation">
          <strong>My account</strong>
          <a className="active" href="#overview"><Icon name="home"/> Overview</a>
          <a href="/profile"><Icon name="user"/> My profile</a>
          <a href="#saved"><Icon name="bookmark"/> Saved items</a>
          <a href="#activity"><Icon name="bell"/> What&apos;s new</a>
        </aside>

        <div className="dashboard-content" id="overview">
          <div className="dashboard-welcome">
            <div><span className="eyebrow">YOUR SPACE</span><h2>Your activity, in one place.</h2><p>Everything you save and follow shows up here.</p></div>
            <span className="welcome-avatar">{user.name.slice(0, 2).toUpperCase()}</span>
          </div>

          <div className="dashboard-stat-grid">
            {stats.map((item) => <div className="dashboard-stat" key={item.label}><span><Icon name={item.icon}/></span><strong>{item.value}</strong><small>{item.label}</small></div>)}
          </div>

          {steps.some((step) => !step.done) && (
            <section className="dashboard-box" aria-labelledby="start-heading">
              <div className="section-heading"><div><h2 id="start-heading">Get started</h2><p>Three simple ways to get more from the site.</p></div></div>
              <ul data-tw className="grid gap-2">
                {steps.map((step) => (
                  <li key={step.label}>
                    <Link href={step.href} className="dashboard-action-link">
                      <span className={`dashboard-step-check ${step.done ? "is-done" : ""}`}>{step.done && <Check className="size-3.5"/>}</span>
                      <span>{step.label}</span><Icon name="arrow" size={15}/>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="dashboard-box" id="saved">
            <div className="section-heading"><div><h2>Saved items</h2><p>Projects and tutorials you have saved.</p></div></div>
            {saved.length > 0 ? (
              <ul data-tw className="dashboard-link-list">
                {saved.map((item) => (
                  <li key={`${item.kind}:${item.slug}`}>
                    <Link href={item.href} className="dashboard-item-link">
                      <span className="dashboard-item-icon"><Icon name={item.kind === "tutorial" ? "book" : "bookmark"}/></span>
                      <span className="dashboard-item-copy"><strong>{item.title}</strong><small>{KIND_LABEL[item.kind]} · saved {date(item.savedAt)}</small></span>
                      <Icon name="arrow" size={15}/>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <Icon name="bookmark" size={24}/><strong>No saved items yet</strong>
                <p>Use the bookmark on any project or tutorial to keep it here.</p>
                <Link className="text-link" href="/projects">Browse projects →</Link>
              </div>
            )}
          </section>

          <section className="dashboard-box" id="activity">
            <div className="section-heading"><div><h2>What&apos;s new</h2><p>Tutorials, projects and updates published since you followed.</p></div></div>
            {!followedSince ? (
              <div className="dashboard-empty">
                <Icon name="bell" size={24}/><strong>Follow to see what is new</strong>
                <p>New tutorials and projects will appear here as they are published.</p>
                <span data-tw><FollowButton/></span>
              </div>
            ) : feed.length > 0 ? (
              <ul data-tw className="dashboard-link-list">
                {feed.map((item) => (
                  <li key={`${item.kind}:${item.href}:${item.at}`}>
                    <Link href={item.href} className="dashboard-item-link">
                      <span className="dashboard-item-icon"><Icon name={item.kind === "tutorial" ? "book" : item.kind === "project" ? "grid" : "bell"}/></span>
                      <span className="dashboard-item-copy"><strong>{item.title}</strong><small>New {KIND_LABEL[item.kind].toLowerCase()} · {date(item.at)}</small></span>
                      <Icon name="arrow" size={15}/>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty compact-empty"><p>You are following. Nothing new has been published yet, and it will show here when it is.</p></div>
            )}
          </section>
        </div>
      </div>

      <div className="notice-box"><Icon name="info"/><p>Orders and project requests are not shown here yet.</p></div>
    </section>
  );
}
