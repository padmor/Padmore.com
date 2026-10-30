import Link from "next/link";
import { projects } from "@/lib/data";
import { ProjectArtwork } from "@/features/projects/components/project-artwork";
import { StatusBadge } from "@/features/projects/components/project-card";

export function HostedAppGrid() {
  const apps = projects.filter((item) => item.status === "Live" || item.status === "Beta");
  if (apps.length === 0) return <p className="muted-copy">No hosted applications have been listed yet.</p>;

  return <div className="hosted-grid">{apps.map((app) => <article className="hosted-card" key={app.slug}>
    <ProjectArtwork visual={app.visual}/>
    <div className="hosted-card-copy">
      <div className="row-between"><span className="eyebrow">{app.type}</span><StatusBadge status={app.status}/></div>
      <h2>{app.title}</h2><p>{app.description}</p>
      <Link className="text-link" href={`/projects/${app.slug}`}>View project details →</Link>
    </div>
  </article>)}</div>;
}
