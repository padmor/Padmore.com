import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SiteImage } from "@/features/content/components/site-image";
import type { ResolvedPortfolioShowcase } from "@/modules/portfolio/showcases";

export function ProjectShowcaseArtwork({ project, imageId }: { project: ResolvedPortfolioShowcase; imageId?: string }) {
  if (imageId) {
    return <SiteImage id={imageId} alt={project.title + " project preview"} />;
  }

  return (
    <div className={`project-showcase-artwork theme-${project.theme}`} role="img" aria-label={`${project.title} project cover`}>
      <div className="project-showcase-artwork-top">
        <span>{project.coverKicker}</span>
        <span>PADMORE / WORK</span>
      </div>
      <div className="project-showcase-artwork-center">
        <span className="project-showcase-artwork-mark" aria-hidden="true">{project.mark}</span>
        <strong>{project.coverTitle}</strong>
      </div>
      <div className="project-showcase-artwork-bottom">
        <span>{project.coverNote}</span>
        <span>0{project.slug === "green-building-creations" ? "1" : project.slug === "gbhpl" ? "2" : project.slug === "hostivo" ? "3" : "4"}</span>
      </div>
      <span className="project-showcase-artwork-orbit" aria-hidden="true" />
    </div>
  );
}

export function ProjectShowcaseCard({ project }: { project: ResolvedPortfolioShowcase }) {
  return (
    <article className="project-showcase-card">
      <Link href={`/work/${project.slug}`} className="project-showcase-media" aria-label={`View ${project.title} project overview`}>
        <ProjectShowcaseArtwork project={project} imageId={project.imageId} />
        <span className={`project-showcase-status is-${project.statusTone}`}>
          <i aria-hidden="true" />{project.status}
        </span>
      </Link>

      <div className="project-showcase-content">
        <span className="project-showcase-subtitle">{project.subtitle}</span>
        <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
        <p>{project.description}</p>
        <div className="project-showcase-actions">
          <Link href={`/work/${project.slug}`} className="project-showcase-details">
            View project <ArrowUpRight aria-hidden="true" />
          </Link>
          {project.slug === "gbhpl" && project.websiteUrl && (
            <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit GBHPL live website">
              Live site <ExternalLink aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
