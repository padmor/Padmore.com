import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data";
import { CoverImage, isUnderConstruction, SiteImage } from "@/features/content/components/site-image";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";
import { trackEngagement } from "@/lib/engagement/client";
import { RecentlyViewedLink } from "@/features/engagement/components/recently-viewed";

export function StatusBadge({ status }: { status: string }) {
  const type = status.toLowerCase().replaceAll(" ", "-");
  return <span className={"status-badge status-" + type}><i/> {status}</span>;
}

// The title link is stretched over the whole card in the standard grid.
// The home variant uses an explicit action and keeps the bookmark independently clickable.
export function ProjectCard({ project, variant = "default" }: { project: Project; variant?: "default" | "featured" }) {
  const status = project.status.toLowerCase().replaceAll(" ", "-");

  if (variant === "featured") {
    const initials = project.title.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

    return (
      <article className="project-card project-card-featured">
        <div className="project-card-media project-card-featured-media">
          {project.imageId ? (
            <SiteImage id={project.imageId} alt={project.title + " project preview"} />
          ) : (
            <div className="project-cover-fallback" role="img" aria-label={project.title + " preview has not been uploaded"}>
              <span>{initials || "PY"}</span>
              <div>
                <strong>{project.title}</strong>
                <small>Project preview not uploaded</small>
              </div>
            </div>
          )}
          <div className="project-card-featured-status">
            <StatusBadge status={project.status} />
          </div>
        </div>

        <div className="project-card-content">
          <div className="project-card-heading">
            <h3><RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={"/projects/" + project.slug} className="project-card-link" onClick={() => trackEngagement("project_open", `/projects/${project.slug}`, project.slug)}>{project.title}</RecentlyViewedLink></h3>
            <BookmarkButton id={project.slug} />
          </div>
          <p className="project-card-featured-description">{project.description || project.type}</p>
          <RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={"/projects/" + project.slug} className="project-card-featured-cta" onClick={() => trackEngagement("project_open", `/projects/${project.slug}`, project.slug)}>
            View project <ArrowRight aria-hidden="true" />
          </RecentlyViewedLink>
        </div>
      </article>
    );
  }

  return (
    <article className="project-card">
      <div className="project-card-media"><CoverImage id={project.imageId} alt={project.title} building={isUnderConstruction(project.status)}/></div>
      <div className="project-card-content">
        <div className="project-card-heading">
          <h3><RecentlyViewedLink kind="project" slug={project.slug} title={project.title} href={"/projects/" + project.slug} className="project-card-link" onClick={() => trackEngagement("project_open", `/projects/${project.slug}`, project.slug)}>{project.title}</RecentlyViewedLink></h3>
          <BookmarkButton id={project.slug}/>
        </div>
        <p className="project-card-meta">{project.type}<span aria-hidden="true"> · </span><span className={"project-card-status is-" + status}>{project.status}</span></p>
        {project.stack.length > 0 && <p className="project-card-stack">{project.stack.slice(0, 3).join(", ")}</p>}
      </div>
    </article>
  );
}
