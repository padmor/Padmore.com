"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, type Role } from "@/lib/auth/session";
import { deleteProject, recordAudit, SaveError, saveProject } from "./repository";
import { projectIdSchema, projectSchema } from "./validation";

export type ProjectFormState = { error?: string };

const CONTENT_ROLES: readonly Role[] = ["owner", "admin", "editor"];

function refreshPublicPages(slugs: string[]) {
  for (const path of ["/", "/projects", "/profile", "/hosted-apps", "/admin", "/admin/projects"]) revalidatePath(path);
  for (const slug of slugs) revalidatePath(`/projects/${slug}`);
}

// Pages being protected does not protect these functions, because any server
// action can be called directly. Each one checks the role again itself.
export async function saveProjectAction(id: string | null, _: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const { user } = await requireRole(CONTENT_ROLES);
  if (id && !projectIdSchema.safeParse(id).success) return { error: "That project no longer exists." };

  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  try {
    const saved = await saveProject(id, parsed.data, user.id, formData);
    await recordAudit(user.id, id ? "project.updated" : "project.created", saved.id, {
      title: parsed.data.title,
      slug: saved.slug,
      visibility: parsed.data.visibility,
    });
    refreshPublicPages([saved.slug]);
  } catch (error) {
    if (error instanceof SaveError) return { error: error.message };
    return { error: "That couldn't be saved. Please try again." };
  }
  redirect("/admin/projects");
}

export async function deleteProjectAction(id: string): Promise<void> {
  const { user } = await requireRole(CONTENT_ROLES);
  if (!projectIdSchema.safeParse(id).success) redirect("/admin/projects");

  const deleted = await deleteProject(id);
  await recordAudit(user.id, "project.deleted", id, { title: deleted.title, slug: deleted.slug });
  refreshPublicPages([deleted.slug]);
  redirect("/admin/projects");
}
