import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export type TutorialFile = {
  id: string;
  kind: "document" | "image" | "audio" | "video";
  title: string;
  fileName: string | null;
  mime: string | null;
  size: number | null;
  videoUrl: string | null;
};

type Row = { id: string; kind: TutorialFile["kind"]; title: string; file_name: string | null; mime_type: string | null; size: number | null; video_url: string | null };

const toFile = (row: Row): TutorialFile => ({ id: row.id, kind: row.kind, title: row.title, fileName: row.file_name, mime: row.mime_type, size: row.size, videoUrl: row.video_url });

// File details only. The bytes are served by /tutorial-files/[id], one file at a time.
export async function listTutorialFiles(postId: string): Promise<TutorialFile[]> {
  const { rows } = await serverDb.execute<Row>(sql`
    select id, kind, title, file_name, mime_type, octet_length(data) as size, video_url
    from public.tutorial_files where post_id = ${postId}::uuid order by created_at asc`);
  return rows.map(toFile);
}

// For the public page: the files of a tutorial, but only while it is published.
export async function listPublicTutorialFiles(slug: string): Promise<TutorialFile[]> {
  const { rows } = await serverDb.execute<Row>(sql`
    select f.id, f.kind, f.title, f.file_name, f.mime_type, octet_length(f.data) as size, f.video_url
    from public.tutorial_files f
    join public.posts p on p.id = f.post_id
    where p.slug = ${slug} and p.content_type = 'tutorial' and p.status = 'published' and p.published_at <= now()
    order by f.created_at asc`);
  return rows.map(toFile);
}

const LABEL_ORDER = ["Video", "Audio", "Slides", "PDF", "Notes", "Files"];
function labelFor(kind: string, mime: string | null) {
  if (kind === "video") return "Video";
  if (kind === "audio") return "Audio";
  if (kind !== "document") return null; // images are not worth a label on a card
  if (mime === "application/pdf") return "PDF";
  if (mime?.includes("presentation")) return "Slides";
  if (mime?.startsWith("text/")) return "Notes";
  return "Files";
}

// For tutorial cards: what each published tutorial has attached, as short labels.
export async function listTutorialResourceLabels(slugs: string[]): Promise<Map<string, string[]>> {
  const labels = new Map<string, string[]>();
  if (slugs.length === 0) return labels;
  const list = sql.join(slugs.map((slug) => sql`${slug}`), sql`, `);
  const { rows } = await serverDb.execute<{ slug: string; kind: string; mime_type: string | null }>(sql`
    select distinct p.slug, f.kind, f.mime_type
    from public.tutorial_files f join public.posts p on p.id = f.post_id
    where p.slug in (${list}) and p.content_type = 'tutorial' and p.status = 'published' and p.published_at <= now()`);
  for (const row of rows) {
    const label = labelFor(row.kind, row.mime_type);
    if (!label) continue;
    const have = new Set(labels.get(row.slug) ?? []);
    have.add(label);
    labels.set(row.slug, LABEL_ORDER.filter((name) => have.has(name)));
  }
  return labels;
}
