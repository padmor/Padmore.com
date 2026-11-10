import Link from "next/link";
import { ArrowBigUp, ArrowRight, Clock, HeartHandshake, MessageSquare, MessageSquareText, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { CommunityComposer } from "@/features/community/components/community-composer";
import { GuestComposer } from "@/features/community/components/guest-composer";
import { PostCard, type PostView } from "@/features/community/components/post-card";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { countCommunityMembers, listCommunityPosts, parseSort, type CommunitySort } from "@/modules/community/repository";

export const metadata = { title: "Community", description: "Share ideas, ask questions and connect with Padmore Yeb and other visitors." };
export const dynamic = "force-dynamic";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return "just now";
}

const SORT_TABS: { key: CommunitySort; label: string; icon: LucideIcon }[] = [
  { key: "latest", label: "Latest", icon: Clock },
  { key: "top", label: "Top", icon: ArrowBigUp },
  { key: "discussed", label: "Discussed", icon: MessageSquare },
];

const RULES = [
  "Be respectful and constructive.",
  "Keep posts relevant to technology, projects and ideas.",
  "No spam, advertising or offensive content.",
  "Do not share passwords or private information.",
];

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sort = parseSort((await searchParams).sort);
  const user = await getCurrentUser();
  const staff = user ? await getCurrentRoles().then((roles) => roles.includes("owner") || roles.includes("admin")).catch(() => false) : false;
  const [posts, members] = await Promise.all([listCommunityPosts(user?.id ?? null, sort).catch(() => null), countCommunityMembers().catch(() => 0)]);

  const views: PostView[] = (posts ?? []).map((post) => ({
    ...post,
    ago: ago(post.createdAt),
    replies: post.replies.map((reply) => ({ ...reply, ago: ago(reply.createdAt) })),
  }));
  const name = user ? (user.name.trim() || user.email.split("@")[0]) : "";

  return (
    <section className="page-container content-page community-page">
      <PageIntro
        eyebrow="PADMORE YEB COMMUNITY"
        title="Share ideas. Ask questions. Connect."
        description="A friendly space for clients, collaborators and fellow developers. Everyone can read, and members can post, reply and upvote."
      />

      <div className="community-summary-strip">
        <div><span><MessageSquareText/></span><strong>{views.length}</strong><small>{views.length === 1 ? "Post" : "Posts"}</small></div>
        <div><span><Users/></span><strong>{members}</strong><small>{members === 1 ? "Contributor" : "Contributors"}</small></div>
        <div className="community-summary-note"><HeartHandshake/><p>Thoughtful discussion, useful feedback and respectful collaboration.</p></div>
      </div>

      <div className="community-layout">
        <div className="community-main">
          <section aria-label="Posts" className="community-post-panel">
            <nav aria-label="Sort posts" className="community-sort-nav">
              {SORT_TABS.map((tab) => (
                <Link key={tab.key} href={tab.key === "latest" ? "/community" : `/community?sort=${tab.key}`} aria-current={sort === tab.key ? "page" : undefined}
                  className={cn("community-sort-tab", sort === tab.key && "active")}>
                  <tab.icon aria-hidden="true"/>{tab.label}
                </Link>
              ))}
            </nav>

            {posts === null ? (
              <p role="alert" className="community-message">The community could not be loaded right now. Please try again shortly.</p>
            ) : views.length === 0 ? (
              <div className="community-empty">
                <span><MessageSquareText/></span>
                <h2>No posts yet</h2>
                <p>Be the first to start a conversation.</p>
              </div>
            ) : (
              <div className="community-post-list">{views.map((post) => <PostCard key={post.id} post={post} viewerId={user?.id ?? null} canModerate={staff}/>)}</div>
            )}
          </section>

          {user ? <CommunityComposer name={name}/> : <GuestComposer/>}
        </div>

        <aside className="community-sidebar">
          <section className="community-side-card" aria-labelledby="about-heading">
            <span className="community-side-icon"><Users/></span>
            <h2 id="about-heading">About this community</h2>
            <p>Run by Padmore Yeb for clients and developers to share ideas, ask questions and help each other.</p>
            <dl>
              <div><dt>Posts</dt><dd>{views.length}</dd></div>
              <div><dt>Contributors</dt><dd>{members}</dd></div>
            </dl>
          </section>

          <section className="community-side-card" aria-labelledby="rules-heading">
            <h2 id="rules-heading">Community guidelines</h2>
            <ol className="community-rules">
              {RULES.map((rule, index) => <li key={rule}><span>{index + 1}</span>{rule}</li>)}
            </ol>
          </section>

          <section className="community-project-card">
            <h2>Have a project in mind?</h2>
            <p>For a private conversation about your requirements, get in touch directly.</p>
            <Button asChild><Link href="/request-project">Start a project <ArrowRight/></Link></Button>
          </section>
        </aside>
      </div>
    </section>
  );
}
