"use server";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";
import { getCurrentUser } from "@/lib/auth/session";
import { consumeRateLimit, type RateLimit } from "@/lib/security/rate-limit";
import { getPublicTutorial } from "@/modules/content/repository";
import { getPublicProject } from "@/modules/portfolio/repository";

const SAVE_LIMIT: RateLimit = { name: "saved-toggle", maxHits: 60, windowSeconds: 600 };
const IMPORT_LIMIT: RateLimit = { name: "saved-import", maxHits: 5, windowSeconds: 600 };

const kind = z.enum(["project", "tutorial"]);
const slug = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Only things that really exist and are public can be saved, so the table never fills with made-up names.
async function isPublic(itemKind: "project" | "tutorial", itemSlug: string) {
  return Boolean(await (itemKind === "project" ? getPublicProject(itemSlug) : getPublicTutorial(itemSlug)).catch(() => null));
}

// Saves the item if it is not saved yet, and removes it if it is.
export async function toggleSavedAction(kindInput: string, slugInput: string): Promise<{ saved: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to save." };
  const itemKind = kind.safeParse(kindInput);
  const itemSlug = slug.safeParse(slugInput);
  if (!itemKind.success || !itemSlug.success) return { error: "That could not be saved." };
  if (!(await consumeRateLimit(SAVE_LIMIT, user.id))) return { error: "Please wait a few minutes and try again." };

  try {
    const removed = await serverDb.execute(sql`delete from public.saved_items where user_id = ${user.id}::uuid and kind = ${itemKind.data} and slug = ${itemSlug.data} returning slug`);
    if (removed.rows.length > 0) { revalidatePath("/dashboard"); return { saved: false }; }
    if (!(await isPublic(itemKind.data, itemSlug.data))) return { error: "That is no longer available to save." };
    await serverDb.execute(sql`insert into public.saved_items (user_id, kind, slug) values (${user.id}::uuid, ${itemKind.data}, ${itemSlug.data}) on conflict do nothing`);
    revalidatePath("/dashboard");
    return { saved: true };
  } catch {
    console.error("Save failed");
    return { error: "Saving is not available right now. Please try again later." };
  }
}

// Bookmarks kept in this browser before accounts could save them move to the account, once.
export async function importLocalBookmarksAction(slugs: string[]): Promise<{ imported: number }> {
  const user = await getCurrentUser();
  if (!user || !Array.isArray(slugs)) return { imported: 0 };
  if (!(await consumeRateLimit(IMPORT_LIMIT, user.id))) return { imported: 0 };

  let imported = 0;
  for (const candidate of [...new Set(slugs)].slice(0, 50)) {
    const itemSlug = slug.safeParse(candidate);
    if (!itemSlug.success || !(await isPublic("project", itemSlug.data))) continue; // the old bookmarks were projects only
    const result = await serverDb.execute(sql`insert into public.saved_items (user_id, kind, slug) values (${user.id}::uuid, 'project', ${itemSlug.data}) on conflict do nothing returning slug`).catch(() => ({ rows: [] }));
    imported += result.rows.length;
  }
  if (imported > 0) revalidatePath("/dashboard");
  return { imported };
}
