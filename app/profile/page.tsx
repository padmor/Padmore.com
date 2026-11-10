import { getAbout } from "@/modules/content/repository";
import { listPublicProjects } from "@/modules/portfolio/repository";
import { PageIntro } from "@/components/page-intro";
import { ProfileHeading } from "@/features/profile/components/profile-heading";
import { ProjectShowcaseCard } from "@/features/projects/components/project-showcase-card";
import { resolvePortfolioShowcases } from "@/modules/portfolio/showcases";

export const metadata = { title: "Profile" };
export const revalidate = 300;

export default async function ProfilePage() {
  const [projects, about] = await Promise.all([listPublicProjects(), getAbout()]);
  const showcaseProjects = resolvePortfolioShowcases(projects);

  return (
    <section className="page-container content-page public-profile-page">
      <PageIntro
        eyebrow="DEVELOPER PROFILE"
        title="Padmore Yeb"
        description={about.headline || "Web and mobile application developer based in Ghana."}
      />

      <div className="profile-panel">
        <ProfileHeading headline={about.headline} location={about.location} photoId={about.photo_id}/>
        {about.intro && <p className="profile-intro-copy">{about.intro}</p>}
        {about.skills.length > 0 && (
          <div className="profile-bio">
            <h3>Technologies and skills</h3>
            <div className="skill-cloud">
              {about.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}
            </div>
          </div>
        )}
        <div className="profile-footer-actions">
          <span>Want to know more about my background and experience?</span>
          <a className="button button-outline button-small" href="/about">Read my story</a>
        </div>
      </div>

      <section className="section-block profile-selected-work" aria-labelledby="profile-work-title">
        <div className="section-heading">
          <div><h2 id="profile-work-title">Selected work</h2><p>A selection of projects across websites, e-commerce and digital products.</p></div>
          <a href="/projects" className="text-link">All projects →</a>
        </div>
        <div className="project-showcase-grid">
          {showcaseProjects.map((project) => <ProjectShowcaseCard key={project.slug} project={project}/>)}
        </div>
      </section>
    </section>
  );
}
