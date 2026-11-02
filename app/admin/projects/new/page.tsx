import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProjectForm } from "@/features/admin/components/project-form";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Add project" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireRole(["owner", "admin", "editor"]);
  return <>
    <Link href="/admin/projects" className="back-link"><Icon name="arrow" size={15}/> Back to projects</Link>
    <div className="admin-title-row"><div><h1>Add project</h1><p>Starts as a draft. Nothing appears on the site until you set it to public.</p></div></div>
    <ProjectForm/>
  </>;
}
