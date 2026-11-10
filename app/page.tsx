import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroIntro } from "@/features/home/components/hero-intro";
import { HeroVisual } from "@/features/home/components/hero-visual";
import { HomeChangesPanel } from "@/features/home/components/home-changes-panel";
import { HomeFollowCard } from "@/features/follow/components/home-follow-card";
import { ProjectShowcaseCard } from "@/features/projects/components/project-showcase-card";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { SectionHeading } from "@/components/page-intro";
import { getAbout, listPublicTutorials } from "@/modules/content/repository";
import { listPublicProjects } from "@/modules/portfolio/repository";
import { resolvePortfolioShowcases } from "@/modules/portfolio/showcases";

export const revalidate = 300;

const featuredTechnologies = [
  { mark: "N", name: "Next.js", tone: "next" },
  { mark: "⚛", name: "React", tone: "react" },
  { mark: "TS", name: "TypeScript", tone: "typescript" },
  { mark: "≈", name: "Tailwind CSS", tone: "tailwind" },
  { mark: "PG", name: "PostgreSQL", tone: "postgres" },
];

export default async function HomePage() {
  const [projects, tutorials, about] = await Promise.all([
    listPublicProjects(),
    listPublicTutorials(3),
    getAbout(),
  ]);

  const location = about.location || "Ghana";
  const homeProjects = resolvePortfolioShowcases(projects);
  const heroPhotoId = about.hero_photo_id ?? about.photo_id ?? null;

  return (
    <>
      <section data-tw className="home-hero-section" aria-label="Introduction">
        <HeroIntro
          showTabs={false}
          about={{
            bio: about.bio,
            education: about.education ?? [],
            interests: about.interests ?? [],
            skills: about.skills ?? [],
            photos: [about.photo_id, about.hero_photo_id].filter((id): id is string => Boolean(id)),
          }}
          profile={null}
          intro={
            <>
              <Badge variant="outline" className="home-role-badge">
                <span className="home-role-dot" aria-hidden="true" />
                Developer <span aria-hidden="true">·</span> {location}
              </Badge>

              <h1 className="home-hero-title">
                Padmore Yeb
                <span><strong>Web &amp; Mobile</strong> Application Developer.</span>
              </h1>

              <p className="home-hero-copy">
                I build modern, reliable and user-friendly digital solutions — from websites to mobile apps, with clean code and great UX.
              </p>

              <div className="home-hero-actions">
                <Button asChild size="lg">
                  <Link href="/projects">
                    View My Projects <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">About Me</Link>
                </Button>
              </div>

              <ul className="home-skill-strip" aria-label="Core technologies and skills">
                {featuredTechnologies.map((technology) => (
                  <li key={technology.name}>
                    <span className={`technology-mark tone-${technology.tone}`} aria-hidden="true">{technology.mark}</span>
                    {technology.name}
                  </li>
                ))}
              </ul>
            </>
          }
          visual={<HeroVisual photoId={heroPhotoId} fallbackSrc="/images/showcase/padmore-hero-reference.webp" />}
        />
        <HomeChangesPanel />
      </section>

      <section id="featured-projects" className="page-container home-page-section" aria-label="Featured projects">
        <SectionHeading
          title="Featured Projects"
          description="A selection of my recent work and personal projects."
          href="/projects"
          linkLabel="View all projects"
        />
        <div className="project-showcase-grid home-project-showcase-grid">
          {homeProjects.map((project) => (
            <ProjectShowcaseCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <div className="page-container home-page-section"><HomeFollowCard/></div>

      <section className="page-container home-page-section home-tutorial-section" aria-label="Latest tutorials">
        <SectionHeading
          title="Latest Tutorials"
          description="Learn, build and improve your skills with easy-to-follow guides."
          href="/tutorials"
          linkLabel="View all tutorials"
        />
        {tutorials.length > 0 ? (
          <div className="tutorial-grid home-tutorial-grid">
            {tutorials.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} />
            ))}
          </div>
        ) : (
          <div className="home-tutorial-empty">
            <span className="home-tutorial-empty-icon" aria-hidden="true">
              <BookOpen />
            </span>
            <div className="home-tutorial-empty-copy">
              <h3>Tutorials are coming soon</h3>
              <p>I’m working on some helpful guides. Stay tuned!</p>
            </div>
            <Link href="#newsletter" className="button button-primary">
              <span aria-hidden="true">♧</span> Get notified <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
