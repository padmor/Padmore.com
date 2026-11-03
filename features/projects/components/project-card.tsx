import Link from "next/link";
import type { Project } from "@/lib/data";
import { CoverImage, isUnderConstruction } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";

export function StatusBadge({ status }: { status: string }) {
  const type = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${type}`}><i/> {status}</span>;
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link href={`/projects/${project.slug}`} className="project-art-link" aria-label={`View ${project.title}`}><CoverImage id={project.imageId} building={isUnderConstruction(project.status)}/></Link>
      <div className="project-card-content">
        <div className="project-card-heading"><div><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.type}</p></div><BookmarkButton id={project.slug}/></div>
        <div className="tag-row">{project.stack.slice(0, 3).map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div>
        <div className="project-card-bottom"><StatusBadge status={project.status}/><Link href={`/projects/${project.slug}`} className="text-link">View details <Icon name="arrow-up-right" size={14}/></Link></div>
      </div>
    </article>
  );
}
