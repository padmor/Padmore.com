import Link from "next/link";
import type { Project } from "@/lib/data";
import { CoverImage, isUnderConstruction } from "@/features/content/components/site-image";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";

export function StatusBadge({ status }: { status: string }) {
  const type = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${type}`}><i/> {status}</span>;
}

// The title link is stretched over the whole card, so the card has a single link
// and no separate "View details". The bookmark sits above it and stays clickable.
export function ProjectCard({ project }: { project: Project }) {
  const status = project.status.toLowerCase().replaceAll(" ", "-");
  return (
    <article className="project-card">
      <div className="project-card-media"><CoverImage id={project.imageId} alt={project.title} building={isUnderConstruction(project.status)}/></div>
      <div className="project-card-content">
        <div className="project-card-heading">
          <h3><Link href={`/projects/${project.slug}`} className="project-card-link">{project.title}</Link></h3>
          <BookmarkButton id={project.slug}/>
        </div>
        <p className="project-card-meta">{project.type}<span aria-hidden="true"> · </span><span className={`project-card-status is-${status}`}>{project.status}</span></p>
        {project.stack.length > 0 && <p className="project-card-stack">{project.stack.slice(0, 3).join(", ")}</p>}
      </div>
    </article>
  );
}
