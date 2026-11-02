import "server-only";
import { auditLogs } from "@/db/schema/schema";
import { serverDb } from "@/db/connection";
import { userDataApi } from "@/lib/db/data-api";
import { discardImage, withImage } from "./images";
import { SaveError } from "./save-error";
import { technologySlug, type ProjectInput } from "./validation";

// Everything here runs as the signed-in staff member, so PostgreSQL RLS has the
// final say. Only the audit record uses the trusted server role, because users
// are deliberately unable to write audit logs themselves.

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  project_type: string | null;
  category: string | null;
  artwork: string;
  lifecycle_status: string;
  visibility: string;
  is_featured: boolean;
  is_tested: boolean;
  demo_url: string | null;
  repository_url: string | null;
  started_on: string | null;
  completed_on: string | null;
  published_at: string | null;
  updated_at: string;
  image_id: string | null;
  project_technologies: { technologies: { name: string } | null }[];
};

const PROJECT_SELECT =
  "id,title,slug,summary,description,project_type,category,artwork,lifecycle_status,visibility,is_featured,is_tested,demo_url,repository_url,started_on,completed_on,published_at,updated_at,image_id,project_technologies(technologies(name))";

export { SaveError };

async function count(path: string): Promise<number | null> {
  const response = await userDataApi(`${path}${path.includes("?") ? "&" : "?"}limit=1`, { headers: { Prefer: "count=exact" } });
  if (!response?.ok) return null;
  const total = response.headers.get("content-range")?.split("/")[1];
  return total && total !== "*" ? Number(total) : null;
}

// Null means this staff role has no access, which is different from zero.
export async function getDashboardStats() {
  const [projects, live, drafts, inProgress, featured, tutorials, products, openInquiries, paidOrders, subscribers] = await Promise.all([
    count("projects?select=id"),
    count("projects?select=id&visibility=eq.public&lifecycle_status=neq.archived"),
    count("projects?select=id&visibility=eq.draft"),
    count("projects?select=id&lifecycle_status=eq.in_progress"),
    count("projects?select=id&is_featured=is.true&visibility=eq.public&lifecycle_status=neq.archived"),
    count("posts?select=id&content_type=eq.tutorial&status=eq.published"),
    count("products?select=id&status=eq.published"),
    count("inquiries?select=id&status=in.(new,reviewing,in_discussion)"),
    count("orders?select=id&status=eq.paid"),
    count("newsletter_subscribers?select=id&status=neq.unsubscribed"),
  ]);
  return { projects, live, drafts, inProgress, featured, tutorials, products, openInquiries, paidOrders, subscribers };
}

export async function listRecentActivity() {
  const response = await userDataApi("audit_logs?select=id,action,metadata,created_at&order=created_at.desc&limit=8");
  if (!response?.ok) return [];
  return (await response.json()) as { id: string; action: string; metadata: { title?: string; slug?: string }; created_at: string }[];
}

export async function listAllProjects(): Promise<AdminProject[]> {
  const response = await userDataApi(`projects?select=${PROJECT_SELECT}&order=updated_at.desc&limit=200`);
  if (!response?.ok) throw new Error("Could not load projects");
  return response.json();
}

export async function getProject(id: string): Promise<AdminProject | null> {
  const response = await userDataApi(`projects?select=${PROJECT_SELECT}&id=eq.${id}&limit=1`);
  if (!response?.ok) throw new Error("Could not load the project");
  const rows: AdminProject[] = await response.json();
  return rows[0] ?? null;
}

async function syncTechnologies(projectId: string, names: string[]) {
  const wanted = new Map<string, string>();
  for (const name of names) {
    const slug = technologySlug(name);
    if (slug && !wanted.has(slug)) wanted.set(slug, name);
  }

  const ids: string[] = [];
  if (wanted.size) {
    const found = await userDataApi(`technologies?select=id,slug&slug=in.(${[...wanted.keys()].join(",")})`);
    if (!found?.ok) throw new SaveError("The project saved, but its technologies couldn't be loaded.");
    const existing: { id: string; slug: string }[] = await found.json();
    ids.push(...existing.map((row) => row.id));

    const known = new Set(existing.map((row) => row.slug));
    const missing = [...wanted].filter(([slug]) => !known.has(slug)).map(([slug, name]) => ({ slug, name }));
    if (missing.length) {
      const created = await userDataApi("technologies?select=id", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(missing),
      });
      if (!created?.ok) throw new SaveError("The project saved, but its technologies couldn't be added.");
      ids.push(...((await created.json()) as { id: string }[]).map((row) => row.id));
    }
  }

  const cleared = await userDataApi(`project_technologies?project_id=eq.${projectId}`, { method: "DELETE" });
  if (!cleared?.ok) throw new SaveError("The project saved, but its technologies couldn't be updated.");
  if (ids.length) {
    const linked = await userDataApi("project_technologies", {
      method: "POST",
      body: JSON.stringify(ids.map((technology_id) => ({ project_id: projectId, technology_id }))),
    });
    if (!linked?.ok) throw new SaveError("The project saved, but its technologies couldn't be linked.");
  }
}

async function failure(response: Response | null): Promise<SaveError> {
  if (!response) return new SaveError("Your session has ended. Please sign in again.");
  const body = await response.json().catch(() => ({}));
  if (body.code === "23505") return new SaveError("Another project already uses that web address.");
  if (response.status === 401 || response.status === 403 || body.code === "42501") return new SaveError("You don't have permission to do that.");
  return new SaveError("That couldn't be saved. Please try again.");
}

export async function saveProject(id: string | null, input: ProjectInput, userId: string, formData: FormData) {
  const { technologies, ...fields } = input;
  let publishedAt: string | null = null;
  let currentImage: string | null = null;
  if (id) {
    const current = await getProject(id);
    if (!current) throw new SaveError("That project no longer exists.");
    publishedAt = current.published_at;
    currentImage = current.image_id;
  }
  // Publish time is set once, so a later edit doesn't reorder the site.
  if (fields.visibility === "public" && !publishedAt) publishedAt = new Date().toISOString();

  return withImage(formData, userId, currentImage, async (image) => {
    const body = JSON.stringify({ ...fields, ...image, published_at: publishedAt, ...(id ? {} : { created_by: userId }) });
    const response = await userDataApi(id ? `projects?id=eq.${id}&select=id,slug` : "projects?select=id,slug", {
      method: id ? "PATCH" : "POST",
      headers: { Prefer: "return=representation" },
      body,
    });
    if (!response?.ok) throw await failure(response);

    const rows: { id: string; slug: string }[] = await response.json();
    if (!rows[0]) throw new SaveError("You don't have permission to do that.");
    await syncTechnologies(rows[0].id, technologies);
    return rows[0];
  });
}

export async function deleteProject(id: string) {
  const response = await userDataApi(`projects?id=eq.${id}&select=slug,title,image_id`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  if (!response?.ok) throw await failure(response);
  const rows: { slug: string; title: string; image_id: string | null }[] = await response.json();
  if (!rows[0]) throw new SaveError("You don't have permission to do that.");
  await discardImage(rows[0].image_id);
  return rows[0];
}

// A failed audit write is reported to the server log but does not undo the change.
export async function recordAudit(actorUserId: string, action: string, resourceId: string, metadata: Record<string, unknown>, resourceType = "project") {
  try {
    await serverDb.insert(auditLogs).values({ actorUserId, action, resourceType, resourceId, metadata });
  } catch {
    console.error(`Audit record failed for ${action}`);
  }
}
