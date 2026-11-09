import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";
import { getCurrentUser } from "@/lib/auth/session";

// Opens in the browser; everything else (Word, Excel, PowerPoint) downloads.
const INLINE = new Set(["application/pdf", "text/markdown", "text/plain", "image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "video/mp4", "video/webm"]);
const MEDIA = /^(audio|video)\//;
// Reading, watching and listening are free. Downloading documents and viewing images needs a free account.
const MEMBERS_ONLY = new Set(["document", "image"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });

  // A file is only reachable while its tutorial is published. Video links are never served here.
  const { rows } = await serverDb.execute<{ kind: string; mime_type: string; file_name: string | null; title: string; content: string }>(sql`
    select f.kind, f.mime_type, f.file_name, f.title, encode(f.data, 'base64') as content
    from public.tutorial_files f
    join public.posts p on p.id = f.post_id
    where f.id = ${id}::uuid and p.status = 'published' and p.published_at <= now() and f.data is not null`);
  const file = rows[0];
  if (!file) return new Response("Not found", { status: 404 });

  const gated = MEMBERS_ONLY.has(file.kind);
  if (gated && !(await getCurrentUser().catch(() => null))) return new Response("Sign in to download this file.", { status: 401, headers: { "Cache-Control": "no-store" } });

  const bytes = Buffer.from(file.content, "base64");
  const wantsDownload = new URL(request.url).searchParams.get("download") === "1";
  const extension = file.file_name?.split(".").pop()?.replace(/[^A-Za-z0-9]/g, "").slice(0, 8) ?? "";
  const name = `${file.title.replace(/[^\w .-]/g, "").trim().slice(0, 80) || "file"}${extension ? `.${extension}` : ""}`;
  const inline = INLINE.has(file.mime_type) && !wantsDownload;
  // Text is always shown as plain text, so a Markdown file can never run as a page.
  const contentType = file.mime_type.startsWith("text/") ? "text/plain; charset=utf-8" : file.mime_type;
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
    "X-Content-Type-Options": "nosniff",
    // A file behind sign-in must never be kept by a shared cache and handed to someone who is not signed in.
    "Cache-Control": gated ? "private, max-age=300" : "public, max-age=300",
    Vary: "Cookie",
  };

  // Audio and video ask for a range so the player can seek.
  if (MEDIA.test(file.mime_type)) {
    headers["Accept-Ranges"] = "bytes";
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
    if (range && (range[1] || range[2])) {
      const last = bytes.length - 1;
      const start = range[1] ? Number(range[1]) : Math.max(0, bytes.length - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), last) : last;
      if (start > end || start > last) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
      return new Response(bytes.subarray(start, end + 1), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${bytes.length}`, "Content-Length": String(end - start + 1) } });
    }
  }
  return new Response(bytes, { headers: { ...headers, "Content-Length": String(bytes.length) } });
}
