import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";
import { detectImageType, MAX_IMAGE_BYTES } from "./image-type";
import { SaveError } from "./save-error";

// These run with the trusted server role, so only call them after requireRole.
// They are deliberately not server actions and can't be reached from a browser.

// What a save should do to the image: nothing (empty), replace it, or remove it.
export type ImageChange = { image_id?: string | null };

export async function readImageChange(formData: FormData, userId: string): Promise<ImageChange> {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) throw new SaveError("Images can be up to 2 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = detectImageType(bytes);
    if (!mime) throw new SaveError("Use a JPEG, PNG or WebP image.");

    try {
      const { rows } = await serverDb.execute<{ id: string }>(
        sql`insert into public.site_images (data, mime_type, uploaded_by) values (decode(${bytes.toString("hex")}, 'hex'), ${mime}, ${userId}) returning id`,
      );
      return { image_id: rows[0].id };
    } catch {
      console.error("Image save failed");
      throw new SaveError("The image couldn't be saved. Please try again.");
    }
  }
  return formData.get("remove_image") === "on" ? { image_id: null } : {};
}

// Failing to tidy up leaves an unused image behind and shouldn't fail the save.
export async function discardImage(id: unknown) {
  if (typeof id !== "string") return;
  await serverDb.execute(sql`delete from public.site_images where id = ${id}`).catch(() => null);
}

export async function listImages() {
  const { rows } = await serverDb.execute<{ id: string; mime_type: string; created_at: string }>(
    sql`select id, mime_type, created_at from public.site_images order by created_at desc limit 500`,
  );
  return rows;
}

// Runs a save with the image attached, and leaves only the image that ended up in use.
export async function withImage<T>(formData: FormData, userId: string, currentId: unknown, save: (change: ImageChange) => Promise<T>): Promise<T> {
  const change = await readImageChange(formData, userId);
  try {
    const result = await save(change);
    if ("image_id" in change) await discardImage(currentId);
    return result;
  } catch (error) {
    await discardImage(change.image_id);
    throw error;
  }
}
