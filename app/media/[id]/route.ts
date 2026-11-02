import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// An image never changes once stored (a replacement gets a new id), so browsers
// and the CDN can keep it, and most views never reach the database.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });

  const { rows } = await serverDb.execute<{ mime_type: string; content: string }>(
    sql`select mime_type, encode(data, 'base64') as content from public.site_images where id = ${id}`,
  );
  const image = rows[0];
  if (!image || !ALLOWED_TYPES.has(image.mime_type)) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(image.content, "base64"), {
    headers: {
      "Content-Type": image.mime_type,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
