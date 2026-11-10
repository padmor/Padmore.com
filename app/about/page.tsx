import { PageIntro } from "@/components/page-intro";
import { FollowButton } from "@/features/follow/components/follow-button";
import { BiographyProfile } from "@/features/home/components/biography-profile";
import { getAbout } from "@/modules/content/repository";
import { listPublicAchievements, listPublicProjects } from "@/modules/portfolio/repository";

export const metadata = { title: "About Me" };
export const revalidate = 300;

export default async function AboutPage() {
  const [about, achievements, projects] = await Promise.all([
    getAbout(),
    listPublicAchievements().catch(() => []),
    listPublicProjects().catch(() => []),
  ]);

  return (
    <section className="page-container content-page about-page">
      <PageIntro
        eyebrow="ABOUT"
        title="A little about me"
        description="My background, the things I enjoy building, and the work that continues to shape my journey."
      />
      <BiographyProfile
        about={about}
        achievements={achievements}
        projectCount={projects.length}
        showFullStory={false}
        follow={<FollowButton />}
      />
    </section>
  );
}
