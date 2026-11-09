"use server";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";
import { parseVideoUrl, videoWatchUrl } from "@/features/achievements/video";
import { requireRole } from "@/lib/auth/session";
import { detectFileType, MAX_FILE_BYTES } from "./file-type";
import { recordAudit } from "./repository";

export type TutorialFileFormState = { error?: string; added?: number };

// The same people who can edit Tutorials can attach files to them.
const STAFF = ["owner", "admin", "editor"] as const;
const FAILED = "The file could not be saved. Please try again.";
const id = z.uuid();

function refresh(postId: string) {
  revalidatePath("/tutorials");
  revalidatePath("/tutorials/[slug]", "page");
  revalidatePath(`/admin/tutorials/${postId}`);
}

export async function addTutorialFileAction(_: TutorialFileFormState, formData: FormData): Promise<TutorialFileFormState> {
  const { user } = await requireRole(STAFF);
  const postId = id.safeParse(formData.get("parentId"));
  if (!postId.success) return { error: FAILED };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length > 150) return { error: "Keep the title under 150 characters." };
  const upload = formData.get("file");
  const hasFile = upload instanceof File && upload.size > 0;
  const link = String(formData.get("video_url") ?? "").trim();
  if (!hasFile && !link) return { error: "Choose a file to upload, or paste a YouTube or Vimeo link." };
  if (hasFile && link) return { error: "Add either a file or a video link, not both." };

  try {
    if (hasFile) {
      if (upload.size > MAX_FILE_BYTES) return { error: `Files can be up to ${MAX_FILE_BYTES / 1024 / 1024} MB. For a longer video or recording, add a YouTube or Vimeo link instead.` };
      const bytes = Buffer.from(await upload.arrayBuffer());
      const type = detectFileType(bytes, upload.name, { media: true });
      if (!type) return { error: "Use a PDF, Word, Excel, PowerPoint, Markdown or text file, an image (JPEG, PNG, WebP), audio (MP3, M4A, OGG, WAV) or video (MP4, WebM)." };
      const label = title || upload.name.replace(/\.[^.]+$/, "").slice(0, 150) || "Attachment";
      await serverDb.execute(sql`
        insert into public.tutorial_files (post_id, kind, title, file_name, mime_type, data, uploaded_by)
        values (${postId.data}::uuid, ${type.kind}, ${label}, ${upload.name.slice(0, 200)}, ${type.mime}, decode(${bytes.toString("hex")}, 'hex'), ${user.id}::uuid)`);
      await recordAudit(user.id, "tutorial.file_added", postId.data, { title: label }, "tutorial");
    } else {
      const video = parseVideoUrl(link);
      if (!video) return { error: "Paste a YouTube or Vimeo link, for example https://www.youtube.com/watch?v=..." };
      const label = title || "Video";
      await serverDb.execute(sql`
        insert into public.tutorial_files (post_id, kind, title, video_url, uploaded_by)
        values (${postId.data}::uuid, 'video', ${label}, ${videoWatchUrl(video)}, ${user.id}::uuid)`);
      await recordAudit(user.id, "tutorial.file_added", postId.data, { title: label }, "tutorial");
    }
  } catch {
    console.error("Tutorial file save failed");
    return { error: FAILED };
  }
  refresh(postId.data);
  return { added: Date.now() };
}

export async function removeTutorialFileAction(formData: FormData): Promise<void> {
  const { user } = await requireRole(STAFF);
  const fileId = id.safeParse(formData.get("fileId"));
  if (!fileId.success) return;
  const { rows } = await serverDb
    .execute<{ post_id: string; title: string }>(sql`delete from public.tutorial_files where id = ${fileId.data}::uuid returning post_id, title`)
    .catch(() => ({ rows: [] as { post_id: string; title: string }[] }));
  const removed = rows[0];
  if (!removed) return;
  await recordAudit(user.id, "tutorial.file_removed", removed.post_id, { title: removed.title }, "tutorial");
  refresh(removed.post_id);
}
