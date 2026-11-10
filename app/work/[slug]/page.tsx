import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { getPortfolioShowcase, PORTFOLIO_SHOWCASES, resolvePortfolioShowcases } from "@/modules/portfolio/showcases";
import { listPublicProjects } from "@/modules/portfolio/repository";
import { ProjectShowcaseArtwork } from "@/features/projects/components/project-showcase-card";

export const revalidate = 3600;

export function generateStaticParams() {
  return PORTFOLIO_SHOWCASES.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioShowcase(slug);
  return project ? {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description },
  } : {};
}

export default async function WorkShowcasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioShowcase(slug);
  if (!project) notFound();

  // Reuse a real uploaded cover from the public project catalogue when a
  // corresponding database entry exists; otherwise the editorial cover remains.
  const publicProjects = await listPublicProjects().catch(() => []);
  const resolved = resolvePortfolioShowcases(publicProjects).find((item) => item.slug === slug) ?? project;

  return (
    <section className="page-container showcase-detail-page">
      <Link href="/#featured-projects" className="showcase-back-link">
        <ArrowLeft aria-hidden="true" /> Back to selected work
      </Link>

      <header className="showcase-detail-hero">
        <div className="showcase-detail-copy">
          <span className="showcase-detail-eyebrow">{project.subtitle}</span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="showcase-detail-status">
            <span className={`project-showcase-status is-${project.statusTone}`}><i aria-hidden="true" />{project.status}</span>
          </div>
          <div className="showcase-detail-actions">
            {project.websiteUrl && (
              <a className="button button-primary" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                {project.websiteLabel ?? "Visit website"} <ExternalLink aria-hidden="true" />
              </a>
            )}
            <Link className="button button-outline" href="/request-project">
              Start a similar project <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="showcase-detail-art">
          <ProjectShowcaseArtwork project={resolved} imageId={resolved.imageId} />
        </div>
      </header>

      <div className="showcase-detail-grid">
        <section className="showcase-detail-section">
          <span className="showcase-section-kicker">OVERVIEW</span>
          <h2>What this project is about</h2>
          <p>{project.description}</p>
          <h2>Project focus</h2>
          <ul className="showcase-highlight-list">
            {project.highlights.map((highlight) => (
              <li key={highlight}><span><Check aria-hidden="true" /></span>{highlight}</li>
            ))}
          </ul>
        </section>

        <aside className="showcase-detail-aside">
          <span className="showcase-section-kicker">PROJECT DETAILS</span>
          <dl>
            <div><dt>Project</dt><dd>{project.title}</dd></div>
            <div><dt>Category</dt><dd>{project.subtitle.split(" · ")[0]}</dd></div>
            <div><dt>Status</dt><dd>{project.status}</dd></div>
          </dl>
          <Link href="/contact" className="showcase-contact-link">
            Ask about this project <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
