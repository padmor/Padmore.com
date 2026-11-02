import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? null : value), schema.nullable());

const webUrl = z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).max(2048);

export const LIFECYCLE_OPTIONS = [
  ["idea", "Idea"],
  ["planning", "Planning"],
  ["in_progress", "In Progress"],
  ["testing", "Testing"],
  ["beta", "Beta"],
  ["live", "Live"],
  ["paused", "Paused"],
  ["completed", "Completed"],
  ["archived", "Archived"],
] as const;

export const VISIBILITY_OPTIONS = [
  ["draft", "Draft (only staff can see it)"],
  ["public", "Public (on the website)"],
  ["private", "Private (hidden, kept for records)"],
] as const;

export const ARTWORK_OPTIONS = ["commerce", "tasks", "portfolio", "weather", "study", "chat"] as const;
export const CATEGORY_OPTIONS = ["Web Apps", "Mobile Apps", "Design", "Backend", "Open Source"] as const;

export const projectIdSchema = z.uuid();

export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(150),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens."),
    summary: z.string().trim().min(1, "Add a short summary.").max(400),
    description: optional(z.string().trim().max(20000)),
    project_type: optional(z.string().trim().max(80)),
    category: z.string().trim().min(1, "Choose a category.").max(80, "Keep the category under 80 characters."),
    artwork: z.enum(ARTWORK_OPTIONS),
    lifecycle_status: z.enum(LIFECYCLE_OPTIONS.map(([value]) => value) as [string, ...string[]]),
    visibility: z.enum(["draft", "public", "private"]),
    is_featured: z.preprocess((value) => value === "on", z.boolean()),
    is_tested: z.preprocess((value) => value === "on", z.boolean()),
    demo_url: optional(webUrl),
    repository_url: optional(webUrl),
    started_on: optional(z.iso.date("Use a valid date.")),
    completed_on: optional(z.iso.date("Use a valid date.")),
    technologies: z
      .string()
      .max(1000)
      .transform((value) => [...new Set(value.split(",").map((name) => name.trim()).filter(Boolean))])
      .pipe(z.array(z.string().max(50, "Keep each technology under 50 characters.")).max(20, "Use at most 20 technologies.")),
  })
  .refine((project) => !project.started_on || !project.completed_on || project.completed_on >= project.started_on, {
    path: ["completed_on"],
    message: "The completion date can't be before the start date.",
  });

export type ProjectInput = z.infer<typeof projectSchema>;

// C++ and C# must not both become "c".
export function technologySlug(name: string) {
  return name
    .toLowerCase()
    .replaceAll("+", "-plus")
    .replaceAll("#", "-sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
