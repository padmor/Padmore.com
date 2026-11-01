// Loads the sample portfolio content as the database owner. Safe to run again:
// anything that already exists, including your own edits, is left untouched.
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { achievements, projects } from "./seed-data.ts";

config({ quiet: true });
const sql = neon(process.env.DATABASE_URL!);

const LIFECYCLE: Record<string, string> = {
  Live: "live",
  "In Progress": "in_progress",
  Testing: "testing",
  Beta: "beta",
  Completed: "completed",
};
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// One minute apart, so that newest-first keeps the original display order.
const start = Date.now() - 60_000;

for (const [index, project] of projects.entries()) {
  const publishedAt = new Date(start - index * 60_000).toISOString();
  const [row] = await sql`
    insert into public.projects
      (title, slug, summary, project_type, category, artwork, lifecycle_status, visibility, is_featured, published_at)
    values
      (${project.title}, ${project.slug}, ${project.description}, ${project.type}, ${project.category}, ${project.visual},
       ${LIFECYCLE[project.status]}, 'public', ${Boolean(project.featured)}, ${publishedAt})
    on conflict (slug) do nothing
    returning id`;
  if (!row) continue;
  for (const name of project.stack) {
    const [technology] = await sql`
      insert into public.technologies (name, slug) values (${name}, ${slugify(name)})
      on conflict (name) do update set name = excluded.name
      returning id`;
    await sql`
      insert into public.project_technologies (project_id, technology_id)
      values (${row.id}, ${technology.id}) on conflict do nothing`;
  }
}

for (const achievement of achievements) {
  await sql`
    insert into public.achievements (title, description, icon, is_published)
    select ${achievement.title}, ${achievement.subtitle}, ${achievement.icon}, true
    where not exists (select 1 from public.achievements where title = ${achievement.title})`;
}

const [counts] = await sql`
  select (select count(*)::int from public.projects) as projects,
         (select count(*)::int from public.technologies) as technologies,
         (select count(*)::int from public.achievements) as achievements`;
console.log("seeded:", counts);
