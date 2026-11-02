import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProject, listPublicProjects } from "@/modules/portfolio/repository";
import { ProjectArtwork } from "@/features/projects/components/project-artwork";
import { StatusBadge } from "@/features/projects/components/project-card";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";

export const revalidate = 300;
export async function generateStaticParams() { return (await listPublicProjects()).map((project) => ({ slug: project.slug })); }
export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  return <section className="page-container detail-page">
    <Link href="/projects" className="back-link"><Icon name="arrow" size={15}/> Back to projects</Link>
    <div className="detail-hero"><div className="detail-heading"><span className="eyebrow">{project.category} · {project.type}</span><h1>{project.title}</h1><p>{project.description}</p><div className="tag-row">{project.stack.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div><div className="detail-actions"><StatusBadge status={project.status}/>{project.demoUrl && <a className="button button-outline button-small" href={project.demoUrl} target="_blank" rel="noopener noreferrer"><Icon name="eye" size={15}/> Live demo</a>}<BookmarkButton id={project.slug}/></div></div><div className="detail-art">{project.imageId ? <SiteImage id={project.imageId} alt={project.title}/> : <ProjectArtwork visual={project.visual}/>}</div></div>
    <div className="detail-columns"><div className="detail-main"><section id="overview" className="detail-section"><h2>Overview</h2><p className="detail-story">{project.details ?? project.description}</p></section><section id="technology" className="detail-section"><h2>Technology</h2><div className="tag-row">{project.stack.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div></section></div><aside className="detail-aside"><h3>Project info</h3><dl><div><dt>Type</dt><dd>{project.type}</dd></div><div><dt>Status</dt><dd><StatusBadge status={project.status}/></dd></div>{project.startedOn && <div><dt>Started</dt><dd>{project.startedOn}</dd></div>}{project.completedOn && <div><dt>Completed</dt><dd>{project.completedOn}</dd></div>}{project.tested && <div><dt>Testing</dt><dd>Tested</dd></div>}<div><dt>Last updated</dt><dd>{project.updated}</dd></div></dl><Link href="/contact" className="button button-primary button-full">Ask about this project <Icon name="arrow" size={15}/></Link></aside></div>
  </section>;
}
