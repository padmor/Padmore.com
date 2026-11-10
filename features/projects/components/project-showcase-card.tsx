import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SiteImage } from "@/features/content/components/site-image";
import type { ResolvedPortfolioShowcase } from "@/modules/portfolio/showcases";
import { trackEngagement } from "@/lib/engagement/client";
import { RecentlyViewedLink } from "@/features/engagement/components/recently-viewed";

export function ProjectShowcaseArtwork({ project, imageId }: { project: ResolvedPortfolioShowcase; imageId?: string }) {
  if (imageId) {
    return <SiteImage id={imageId} alt={project.title + " project preview"} />;
  }

  return (
    <div className={`project-showcase-reference-cover cover-${project.referenceCoverIndex}`} role="img" aria-label={`${project.title} project preview from the approved portfolio design`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/showcase/padmore-project-covers.webp" alt="" aria-hidden="true" loading="lazy" />
    </div>
  );
}

export function ProjectShowcaseCard({ project }: { project: ResolvedPortfolioShowcase }) {
  return (
    <article className="project-showcase-card">
      <RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={`/work/${project.slug}`} className="project-showcase-media">
        <ProjectShowcaseArtwork project={project} imageId={project.imageId} />
        <span className={`project-showcase-status is-${project.statusTone}`}>
          <i aria-hidden="true" />{project.status}
        </span>
      </RecentlyViewedLink>

      <div className="project-showcase-content">
        <span className="project-showcase-subtitle">{project.subtitle}</span>
        <h3><RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={`/work/${project.slug}`}>{project.title}</RecentlyViewedLink></h3>
        <p>{project.description}</p>
        <div className="project-showcase-actions">
          <RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={`/work/${project.slug}`} className="project-showcase-details">
            View project <ArrowUpRight aria-hidden="true" />
          </RecentlyViewedLink>
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
