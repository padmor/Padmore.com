import { AchievementBoard } from "@/features/achievements/components/achievement-board";

export const metadata = { title: "Achievements", description: "Certificates, awards and professional milestones, with supporting documents, images and videos." };
export const revalidate = 300;

export default function AchievementsPage() {
  return <div data-tw className="bg-background">
    <div className="page-container pt-10 pb-16 sm:pt-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] text-foreground">Certificates, awards and milestones</h1>
        <p className="mt-2 text-base leading-relaxed text-soft-foreground">Professional credentials and notable work, with the supporting documents, images and videos to back them up.</p>
      </header>
      <div className="mt-8"><AchievementBoard/></div>
    </div>
  </div>;
}
