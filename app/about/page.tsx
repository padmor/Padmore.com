import { FollowButton } from "@/features/follow/components/follow-button";
import { BiographyProfile } from "@/features/home/components/biography-profile";
import { getAbout } from "@/modules/content/repository";
import { listPublicAchievements, listPublicProjects } from "@/modules/portfolio/repository";

export const metadata = { title: "About Me" };
export const revalidate = 300;

// The same profile as the About me tab on the home page, so the two always match.
export default async function AboutPage() {
  const [about, achievements, projects] = await Promise.all([getAbout(), listPublicAchievements().catch(() => []), listPublicProjects().catch(() => [])]);
  return <div data-tw className="page-container pt-8 pb-16 sm:pt-12">
    <h1 className="sr-only">About me</h1>
    <BiographyProfile about={about} achievements={achievements} projectCount={projects.length} showFullStory={false} follow={<FollowButton/>}/>
  </div>;
}
