import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProject, listPublicProjects } from "@/modules/portfolio/repository";
import { ProjectArtwork } from "@/features/projects/components/project-artwork";
import { StatusBadge } from "@/features/projects/components/project-card";
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
    <div className="detail-hero"><div className="detail-heading"><span className="eyebrow">{project.category} · {project.type}</span><h1>{project.title}</h1><p>{project.description}</p><div className="tag-row">{project.stack.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div><div className="detail-actions"><StatusBadge status={project.status}/><button className="button button-outline button-small" type="button"><Icon name="eye" size={15}/> Demo preview</button><BookmarkButton id={project.slug}/></div></div><div className="detail-art"><ProjectArtwork visual={project.visual}/></div></div>
    <div className="detail-columns"><div className="detail-main"><div className="detail-tabs"><a className="active" href="#overview">Overview</a><a href="#features">Features</a><a href="#technology">Tech stack</a><a href="#timeline">Timeline</a></div><section id="overview" className="detail-section"><h2>Overview</h2><p>{project.description} This portfolio entry is an illustrative case-study starter. The real project story, screenshots, technical decisions and outcomes should be added before publishing it as completed work.</p><h3>Key focus areas</h3><ul className="check-list"><li>Clear and accessible user experience</li><li>Responsive page and component structure</li><li>Thoughtful data and interaction patterns</li><li>Performance and maintainability</li></ul></section><section id="features" className="detail-section"><h2>Features</h2><div className="feature-list"><span>Responsive interface</span><span>Reusable components</span><span>Clear navigation</span><span>Accessible interactions</span></div></section><section id="technology" className="detail-section"><h2>Technology</h2><div className="tag-row">{project.stack.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}</div></section><section id="timeline" className="detail-section"><h2>Development timeline</h2><p className="muted-copy">Add verified milestones and release notes for this project.</p></section></div><aside className="detail-aside"><h3>Project info</h3><dl><div><dt>Type</dt><dd>{project.type}</dd></div><div><dt>Status</dt><dd><StatusBadge status={project.status}/></dd></div><div><dt>Last updated</dt><dd>{project.updated}</dd></div><div><dt>Availability</dt><dd>Not configured</dd></div></dl><div className="notice-box"><Icon name="info"/><p>This is sample portfolio content. Replace it with verified project details before making it public.</p></div><Link href="/contact" className="button button-primary button-full">Ask about this project <Icon name="arrow" size={15}/></Link></aside></div>
  </section>;
}
