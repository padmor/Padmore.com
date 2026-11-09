import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { listPublicProjects } from "@/modules/portfolio/repository";
import { CoverImage } from "@/features/content/components/site-image";
import { StatusBadge } from "@/features/projects/components/project-card";

export async function HostedAppGrid() {
  const apps = (await listPublicProjects()).filter((item) => item.status === "Live" || item.status === "Beta");
  if (apps.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><ArrowUpRight size={24}/></span>
        <h3>No live projects yet</h3>
        <p>When a project is ready to use, it will appear here with a direct link to its live version.</p>
      </div>
    );
  }

  return (
    <div className="hosted-grid">
      {apps.map((app) => (
        <article className="hosted-card" key={app.slug}>
          <Link href={`/projects/${app.slug}`} className="hosted-card-image" aria-label={`View ${app.title} details`}>
            <CoverImage id={app.imageId} alt={app.title}/>
          </Link>
          <div className="hosted-card-copy">
            <div className="row-between"><span className="eyebrow">{app.type}</span><StatusBadge status={app.status}/></div>
            <h2><Link href={`/projects/${app.slug}`}>{app.title}</Link></h2>
            <p>{app.description}</p>
            <div className="hosted-card-actions">
              {app.demoUrl && <a className="button button-primary button-small" href={app.demoUrl} target="_blank" rel="noopener noreferrer">Open live project <ExternalLink size={14}/></a>}
              <Link className="button button-outline button-small" href={`/projects/${app.slug}`}>Project details <ArrowUpRight size={14}/></Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
