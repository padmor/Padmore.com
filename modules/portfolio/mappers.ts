import type { Project, ProjectStatus } from "@/lib/data";

const STATUS_LABELS: Record<string, ProjectStatus> = {
  idea: "Idea",
  planning: "Planning",
  in_progress: "In Progress",
  paused: "Paused",
  testing: "Testing",
  beta: "Beta",
  live: "Live",
  completed: "Completed",
};

const ARTWORK = new Set<string>(["commerce", "tasks", "portfolio", "weather", "study", "chat"]);

export type ProjectRow = {
  slug: string;
  title: string;
  summary: string | null;
  description?: string | null;
  demoUrl?: string | null;
  projectType: string | null;
  category: string | null;
  artwork: string;
  lifecycleStatus: string;
  isFeatured: boolean;
  updatedAt: string;
  imageId?: string | null;
  isTested?: boolean;
  startedOn?: string | null;
  completedOn?: string | null;
};

// An explicit allowlist: internal columns such as created_by never reach a page.
export function toProject(row: ProjectRow, stack: string[]): Project {
  return {
    slug: row.slug,
    title: row.title,
    type: row.projectType ?? "Project",
    description: row.summary ?? "",
    details: row.description ?? undefined,
    demoUrl: row.demoUrl ?? undefined,
    status: STATUS_LABELS[row.lifecycleStatus] ?? "In Progress",
    stack,
    category: row.category ?? "Other",
    visual: (ARTWORK.has(row.artwork) ? row.artwork : "portfolio") as Project["visual"],
    updated: `Updated ${new Date(row.updatedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}`,
    featured: row.isFeatured,
    imageId: row.imageId ?? undefined,
    tested: row.isTested ?? false,
    startedOn: row.startedOn ?? undefined,
    completedOn: row.completedOn ?? undefined,
  };
}
