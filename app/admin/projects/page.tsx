import Link from "next/link";
import { Icon } from "@/components/icon";
import { requireRole } from "@/lib/auth/session";
import { listAllProjects } from "@/modules/admin/repository";
import { LIFECYCLE_OPTIONS } from "@/modules/admin/validation";

export const metadata = { title: "Manage projects" };
export const dynamic = "force-dynamic";

const STATUS = new Map<string, string>(LIFECYCLE_OPTIONS);

export default async function AdminProjectsPage() {
  await requireRole(["owner", "admin", "editor"]);
  const projects = await listAllProjects();
  return <>
    <div className="admin-title-row">
      <div><span className="eyebrow">CONTENT</span><h1>Projects</h1><p>{projects.length} in total, including drafts and private projects.</p></div>
      <Link className="button button-primary button-small" href="/admin/projects/new"><Icon name="plus" size={15}/> Add project</Link>
    </div>
    {projects.length ? <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Visibility</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{projects.map((project) => <tr key={project.id}>
        <td className="admin-title-cell">{/* eslint-disable-next-line @next/next/no-img-element */}{project.image_id && <img className="admin-thumb" src={`/media/${project.image_id}`} alt="" loading="lazy"/>}<div><strong>{project.title}</strong>{project.is_featured && <small> · Featured</small>}<br/><small>/projects/{project.slug}</small></div></td>
        <td>{STATUS.get(project.lifecycle_status) ?? project.lifecycle_status}</td>
        <td><span className={`admin-visibility admin-visibility-${project.visibility}`}>{project.visibility}</span></td>
        <td>{new Date(project.updated_at).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })}</td>
        <td><Link className="text-link" href={`/admin/projects/${project.id}`}>Edit</Link></td>
      </tr>)}</tbody>
    </table></div> : <div className="dashboard-empty"><strong>No projects yet</strong><p>Add your first project to get started.</p></div>}
  </>;
}
