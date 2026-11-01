import "server-only";
import { and, desc, eq, inArray, lte, ne, sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";
import { achievements, projects, projectTechnologies, technologies } from "@/db/schema/schema";
import { toProject, type ProjectRow } from "./mappers";

const LIST_LIMIT = 100;

const projectColumns = {
  id: projects.id,
  slug: projects.slug,
  title: projects.title,
  summary: projects.summary,
  projectType: projects.projectType,
  category: projects.category,
  artwork: projects.artwork,
  lifecycleStatus: projects.lifecycleStatus,
  isFeatured: projects.isFeatured,
  updatedAt: projects.updatedAt,
};

// RLS enforces this as well. Stating it here keeps the rule visible in the query.
const isPublic = and(
  eq(projects.visibility, "public"),
  ne(projects.lifecycleStatus, "archived"),
  lte(projects.publishedAt, sql`now()`),
);

async function withStacks(rows: (ProjectRow & { id: string })[]) {
  if (!rows.length) return [];
  const links = await serverDb
    .select({ projectId: projectTechnologies.projectId, name: technologies.name })
    .from(projectTechnologies)
    .innerJoin(technologies, eq(technologies.id, projectTechnologies.technologyId))
    .where(inArray(projectTechnologies.projectId, rows.map((row) => row.id)))
    .orderBy(technologies.name);

  const stacks = new Map<string, string[]>();
  for (const link of links) stacks.set(link.projectId, [...(stacks.get(link.projectId) ?? []), link.name]);
  return rows.map((row) => toProject(row, stacks.get(row.id) ?? []));
}

export async function listPublicProjects(limit = LIST_LIMIT) {
  const rows = await serverDb
    .select(projectColumns)
    .from(projects)
    .where(isPublic)
    .orderBy(desc(projects.publishedAt))
    .limit(Math.min(limit, LIST_LIMIT));
  return withStacks(rows);
}

export async function getPublicProject(slug: string) {
  const rows = await serverDb
    .select(projectColumns)
    .from(projects)
    .where(and(isPublic, eq(projects.slug, slug)))
    .limit(1);
  return (await withStacks(rows))[0] ?? null;
}

export async function listPublicAchievements() {
  const rows = await serverDb
    .select({
      title: achievements.title,
      description: achievements.description,
      achievedOn: achievements.achievedOn,
      icon: achievements.icon,
    })
    .from(achievements)
    .where(eq(achievements.isPublished, true))
    .orderBy(achievements.createdAt)
    .limit(LIST_LIMIT);
  return rows.map((row) => ({
    title: row.title,
    subtitle: row.description ?? "",
    year: row.achievedOn?.slice(0, 4) ?? "Add year",
    icon: row.icon ?? "★",
  }));
}
