import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";
import { listPublicTutorials } from "@/modules/content/repository";
import { listPublicProjects } from "@/modules/portfolio/repository";

export type SavedKind = "project" | "tutorial";
export type SavedItem = { kind: SavedKind; slug: string; title: string; href: string; savedAt: string };

// "project:my-app", "tutorial:react-basics": what the buttons on the page look up.
export async function listSavedKeys(userId: string): Promise<string[]> {
  const { rows } = await serverDb.execute<{ kind: SavedKind; slug: string }>(sql`select kind, slug from public.saved_items where user_id = ${userId}::uuid order by created_at desc`);
  return rows.map((row) => `${row.kind}:${row.slug}`);
}

// For the dashboard. Anything that has since been unpublished or deleted is left out.
export async function listSavedItems(userId: string): Promise<SavedItem[]> {
  const { rows } = await serverDb.execute<{ kind: SavedKind; slug: string; created_at: string | Date }>(sql`select kind, slug, created_at from public.saved_items where user_id = ${userId}::uuid order by created_at desc limit 100`);
  if (rows.length === 0) return [];
  const [projects, tutorials] = await Promise.all([listPublicProjects(), listPublicTutorials(100)]);
  const projectTitles = new Map(projects.map((project) => [project.slug, project.title]));
  const tutorialTitles = new Map(tutorials.map((tutorial) => [tutorial.slug, tutorial.title]));
  return rows.flatMap((row) => {
    const title = (row.kind === "project" ? projectTitles : tutorialTitles).get(row.slug);
    return title ? [{ kind: row.kind, slug: row.slug, title, href: `/${row.kind === "project" ? "projects" : "tutorials"}/${row.slug}`, savedAt: new Date(row.created_at).toISOString() }] : [];
  });
}
