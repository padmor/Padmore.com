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
  description: projects.description,
  demoUrl: projects.demoUrl,
  projectType: projects.projectType,
  category: projects.category,
  artwork: projects.artwork,
  lifecycleStatus: projects.lifecycleStatus,
  isFeatured: projects.isFeatured,
  updatedAt: projects.updatedAt,
  imageId: projects.imageId,
  isTested: projects.isTested,
  startedOn: projects.startedOn,
  completedOn: projects.completedOn,
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

export type AchievementFile = {
  id: string;
  kind: "document" | "image" | "video";
  title: string;
  fileName: string | null;
  mime: string | null;
  size: number | null;
  videoUrl: string | null;
};

type FileRow = { id: string; achievement_id: string; kind: AchievementFile["kind"]; title: string; file_name: string | null; mime_type: string | null; size: number | null; video_url: string | null };

// File details only. The bytes are served by /achievement-files/[id], one file at a time.
export async function listAchievementFiles(achievementIds: string[]): Promise<Map<string, AchievementFile[]>> {
  const byAchievement = new Map<string, AchievementFile[]>();
  if (achievementIds.length === 0) return byAchievement;
  const ids = sql.join(achievementIds.map((id) => sql`${id}::uuid`), sql`, `);
  const { rows } = await serverDb.execute<FileRow>(sql`
    select id, achievement_id, kind, title, file_name, mime_type, octet_length(data) as size, video_url
    from public.achievement_files where achievement_id in (${ids}) order by created_at asc`);
  for (const row of rows) {
    const list = byAchievement.get(row.achievement_id) ?? [];
    list.push({ id: row.id, kind: row.kind, title: row.title, fileName: row.file_name, mime: row.mime_type, size: row.size, videoUrl: row.video_url });
    byAchievement.set(row.achievement_id, list);
  }
  return byAchievement;
}

export async function listPublicAchievements() {
  const rows = await serverDb
    .select({
      id: achievements.id,
      category: achievements.category,
      title: achievements.title,
      description: achievements.description,
      achievedOn: achievements.achievedOn,
      icon: achievements.icon,
      imageId: achievements.imageId,
      organization: achievements.organization,
      credentialUrl: achievements.credentialUrl,
    })
    .from(achievements)
    .where(eq(achievements.isPublished, true))
    .orderBy(achievements.createdAt)
    .limit(LIST_LIMIT);
  const files = await listAchievementFiles(rows.map((row) => row.id)).catch(() => new Map<string, AchievementFile[]>());
  return rows.map((row) => ({
    id: row.id,
    category: row.category as "certificate" | "award" | "milestone",
    files: files.get(row.id) ?? [],
    title: row.title,
    subtitle: row.description ?? "",
    year: row.achievedOn?.slice(0, 4) ?? "",
    icon: row.icon ?? "★",
    imageId: row.imageId,
    organization: row.organization,
    credentialUrl: row.credentialUrl,
  }));
}
