import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { DeleteProjectButton } from "@/features/admin/components/delete-project-button";
import { ProjectForm } from "@/features/admin/components/project-form";
import { requireRole } from "@/lib/auth/session";
import { getProject } from "@/modules/admin/repository";
import { projectIdSchema } from "@/modules/admin/validation";

export const metadata = { title: "Edit project" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["owner", "admin", "editor"]);
  const { id } = await params;
  if (!projectIdSchema.safeParse(id).success) notFound();
  const project = await getProject(id);
  if (!project) notFound();
  return <>
    <Link href="/admin/projects" className="back-link"><Icon name="arrow" size={15}/> Back to projects</Link>
    <div className="admin-title-row"><div><h1>{project.title}</h1><p>Public changes appear on the site as soon as you save.</p></div><DeleteProjectButton id={project.id} title={project.title}/></div>
    <ProjectForm project={project}/>
  </>;
}
