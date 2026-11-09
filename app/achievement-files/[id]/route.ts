import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";

// Documents and images attached to a published achievement. Videos are links and are never served here.
const INLINE = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });

  // A file is only reachable while its achievement is published.
  const { rows } = await serverDb.execute<{ mime_type: string; file_name: string | null; title: string; content: string }>(sql`
    select f.mime_type, f.file_name, f.title, encode(f.data, 'base64') as content
    from public.achievement_files f
    join public.achievements a on a.id = f.achievement_id
    where f.id = ${id}::uuid and a.is_published = true and f.kind <> 'video' and f.data is not null`);
  const file = rows[0];
  if (!file) return new Response("Not found", { status: 404 });

  const wantsDownload = new URL(request.url).searchParams.get("download") === "1";
  const extension = file.file_name?.split(".").pop()?.replace(/[^A-Za-z0-9]/g, "").slice(0, 8) ?? "";
  const name = `${file.title.replace(/[^\w .-]/g, "").trim().slice(0, 80) || "file"}${extension ? `.${extension}` : ""}`;
  const inline = INLINE.has(file.mime_type) && !wantsDownload;

  return new Response(Buffer.from(file.content, "base64"), {
    headers: {
      "Content-Type": file.mime_type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
    },
  });
}
