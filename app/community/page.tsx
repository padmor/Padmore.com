import Link from "next/link";
import { ArrowBigUp, ArrowRight, Clock, HeartHandshake, MessageSquare, MessageSquareText, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityComposer } from "@/features/community/components/community-composer";
import { GuestComposer } from "@/features/community/components/guest-composer";
import { PostCard, type PostView } from "@/features/community/components/post-card";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { countCommunityMembers, listCommunityPosts, parseSort, type CommunitySort } from "@/modules/community/repository";

export const metadata = { title: "Community", description: "Share ideas, ask questions and connect with Padmore Yeb and other visitors." };
// Shows who is signed in and which posts they have upvoted, so it is never cached.
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

  return <div data-tw className="relative isolate overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 -right-24 size-[460px] rounded-full bg-violet/10 blur-[120px] dark:bg-violet/20"/>
      <div className="absolute top-1/2 -left-32 size-[420px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15"/>
    </div>

    <div className="page-container pt-8 pb-16 sm:pt-10">
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-[#5b4fe0] to-violet p-6 text-white shadow-[0_32px_64px_-32px_var(--primary)] sm:p-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.22)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(110deg,#000_10%,transparent_75%)]"/>
        <div aria-hidden="true" className="absolute -top-20 -right-20 size-72 rounded-full bg-white/15 blur-3xl"/>
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur"><HeartHandshake className="size-4"/>Padmore Yeb Community</span>
            <h1 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">Share ideas. Ask questions. Connect.</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">A friendly space for clients, collaborators and fellow developers. Everyone can read, and members can post, reply and upvote.</p>
          </div>
          <ul className="m-0 flex list-none gap-3 p-0 text-sm">
            <li className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><strong className="block font-display text-2xl font-semibold tabular-nums">{views.length}</strong><span className="text-white/80">{views.length === 1 ? "Post" : "Posts"}</span></li>
            <li className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><strong className="block font-display text-2xl font-semibold tabular-nums">{members}</strong><span className="text-white/80">{members === 1 ? "Contributor" : "Contributors"}</span></li>
          </ul>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid min-w-0 gap-4">
          <section aria-label="Posts" className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm">
            <nav aria-label="Sort posts" className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-3 py-2.5">
              {SORT_TABS.map((tab) => <Link key={tab.key} href={tab.key === "latest" ? "/community" : `/community?sort=${tab.key}`} aria-current={sort === tab.key ? "page" : undefined}
                className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition", sort === tab.key ? "bg-card text-foreground shadow-[0_1px_3px_rgb(16_27_61/0.1),0_0_0_1px_var(--border)]" : "text-muted-foreground hover:text-foreground")}><tab.icon className="size-4"/>{tab.label}</Link>)}
            </nav>

            {posts === null
              ? <p role="alert" className="m-0 p-10 text-center text-soft-foreground">The community could not be loaded right now. Please try again shortly.</p>
              : views.length === 0
                ? <div className="p-12 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><MessageSquareText className="size-6"/></span>
                  <h2 className="m-0 mt-4 font-display text-lg font-semibold text-foreground">No posts yet</h2>
                  <p className="m-0 mt-1 text-sm text-muted-foreground">Be the first to start a conversation.</p>
                </div>
                : <div className="divide-y divide-border">{views.map((post) => <PostCard key={post.id} post={post} viewerId={user?.id ?? null} canModerate={staff}/>)}</div>}
          </section>

          {user ? <CommunityComposer name={name}/> : <GuestComposer/>}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur-sm" aria-labelledby="about-heading">
            <div aria-hidden="true" className="h-14 bg-linear-to-r from-primary to-violet"/>
            <div className="-mt-6 px-5 pb-5">
              <span className="grid size-12 place-items-center rounded-2xl border-4 border-card bg-linear-to-br from-primary to-violet text-white shadow-md"><Users className="size-5"/></span>
              <h2 id="about-heading" className="m-0 mt-3 font-display text-lg font-semibold tracking-[-0.02em] text-foreground">About this community</h2>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-soft-foreground">Run by Padmore Yeb for clients and developers to share ideas, ask questions and help each other.</p>
              <dl className="m-0 mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                <div><dt className="text-xs text-muted-foreground">Posts</dt><dd className="m-0 font-display text-lg font-semibold text-foreground tabular-nums">{views.length}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Contributors</dt><dd className="m-0 font-display text-lg font-semibold text-foreground tabular-nums">{members}</dd></div>
              </dl>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-sm" aria-labelledby="rules-heading">
            <h2 id="rules-heading" className="m-0 font-display text-base font-semibold tracking-[-0.02em] text-foreground">Community rules</h2>
            <ol className="m-0 mt-4 grid list-none gap-3 p-0">{RULES.map((rule, index) => <li key={rule} className="flex gap-3 text-sm leading-relaxed text-soft-foreground">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary tabular-nums">{index + 1}</span>{rule}
            </li>)}</ol>
          </section>

          <section className="rounded-3xl bg-foreground p-5 text-background">
            <h2 className="m-0 font-display text-base font-semibold tracking-[-0.02em]">Have a project in mind?</h2>
            <p className="m-0 mt-1.5 text-sm leading-relaxed opacity-75">For a private conversation about your requirements, get in touch directly.</p>
            <Button asChild className="mt-4 bg-background text-foreground shadow-none hover:bg-background/90"><Link href="/request-project">Start a project <ArrowRight/></Link></Button>
          </section>
        </aside>
      </div>
    </div>
  </div>;
}
