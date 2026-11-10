import { PageIntro } from "@/components/page-intro";
import { AchievementBoard } from "@/features/achievements/components/achievement-board";

export const metadata = {
  title: "Achievements",
  description: "Certificates, awards and professional milestones, with supporting documents, images and videos.",
};
export const revalidate = 300;

export default function AchievementsPage() {
  return (
    <section className="page-container content-page achievements-page">
      <PageIntro
        eyebrow="CREDENTIALS & MILESTONES"
        title="Achievements"
        description="A record of certificates, awards and meaningful milestones, with supporting documents and media where available."
      />
      <div className="achievements-content">
        <AchievementBoard />
      </div>
    </section>
  );
}
