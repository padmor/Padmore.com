import Link from "next/link";
import { listPublicProjects } from "@/modules/portfolio/repository";
import { CoverImage } from "@/features/content/components/site-image";
import { StatusBadge } from "@/features/projects/components/project-card";

export async function HostedAppGrid() {
  const apps = (await listPublicProjects()).filter((item) => item.status === "Live" || item.status === "Beta");
  if (apps.length === 0) return <p className="muted-copy">No hosted applications have been listed yet.</p>;

  return <div className="hosted-grid">{apps.map((app) => <article className="hosted-card" key={app.slug}>
    <CoverImage id={app.imageId}/>
    <div className="hosted-card-copy">
      <div className="row-between"><span className="eyebrow">{app.type}</span><StatusBadge status={app.status}/></div>
      <h2>{app.title}</h2><p>{app.description}</p>
      {app.demoUrl && <a className="text-link" href={app.demoUrl} target="_blank" rel="noopener noreferrer">Open live demo ↗</a>} <Link className="text-link" href={`/projects/${app.slug}`}>View project details →</Link>
    </div>
  </article>)}</div>;
}
