import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { AchievementBoard } from "@/features/achievements/components/achievement-board";
export const metadata = { title: "Achievements" };
export const revalidate = 300;

export default function AchievementsPage() {
  return <section className="page-container content-page">
    <PageIntro eyebrow="MILESTONES & GROWTH" title="Achievements & Updates" description="A record of learning milestones, launches, projects and moments worth sharing."/>
    <div className="achievement-tabs"><a className="active" href="#achievements">Achievements</a><a href="/updates">Updates</a><a href="#timeline">Timeline</a></div>
    <AchievementBoard/>
    <div className="notice-box"><Icon name="info"/><p>Achievement cards and dates are placeholders. Only publish verifiable accomplishments.</p></div>
  </section>;
}
