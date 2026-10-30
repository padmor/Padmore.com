import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { FollowCard } from "@/features/community/components/follow-card";
export const metadata = { title: "Community" };
const members = [
 { name: "Alex Carter", role: "Full Stack Developer", initials: "AC", tone: "blue" },
 { name: "Sarah Johnson", role: "UI/UX Designer", initials: "SJ", tone: "violet" },
 { name: "Mike Brown", role: "Frontend Developer", initials: "MB", tone: "cyan" },
 { name: "Emma Davis", role: "Backend Developer", initials: "ED", tone: "peach" },
];
export default function CommunityPage() { return <section className="page-container content-page"><PageIntro eyebrow="CONNECT & GROW" title="Community" description="Connect with the people, follow creators and be part of something bigger."/><div className="community-hero"><div><span className="eyebrow">BUILDERS · CREATORS · LEARNERS</span><h2>Good work grows through shared ideas.</h2><p>Follow the journey, save useful resources and discover people building things that matter.</p><Link href="/signup" className="button button-primary">Create an account <Icon name="arrow" size={16}/></Link></div><div className="community-shapes"><span>✳</span><span>◈</span><span>⌘</span></div></div><div className="community-toolbar"><div className="filter-pills"><span className="filter-pill active">Members</span><span className="filter-pill">Projects</span><span className="filter-pill">Discussions</span></div><span className="muted-copy">Sample community layout</span></div><div className="member-grid">{members.map((member) => <FollowCard key={member.initials} member={member}/>)}</div><div className="community-join"><div><h2>Join the community</h2><p>Be part of a growing space for builders, learners and creators.</p></div><Link href="/signup" className="button button-primary">Create account <Icon name="arrow" size={16}/></Link></div></section>; }
