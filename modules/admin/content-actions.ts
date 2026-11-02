"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, type Role } from "@/lib/auth/session";
import { aboutSchema, COLLECTIONS, isCollection } from "./collections";
import { deleteContent, saveAbout, saveContent } from "./content-repository";
import { recordAudit, SaveError } from "./repository";
import { projectIdSchema } from "./validation";

export type ContentFormState = { error?: string };

function refresh(publicPath: string, adminPath: string) {
  // The home page lists tutorials, and the details pages sit under the public path.
  revalidatePath("/");
  revalidatePath(publicPath, "layout");
  revalidatePath("/admin");
  revalidatePath(adminPath);
}

// Any server action can be called directly, so each one checks the role itself
// and never trusts the collection name it is given.
export async function saveContentAction(key: string, id: string | null, _: ContentFormState, formData: FormData): Promise<ContentFormState> {
  if (!isCollection(key)) return { error: "That section doesn't exist." };
  const collection = COLLECTIONS[key];
  const { user } = await requireRole(collection.roles as readonly Role[]);
  if (id && !projectIdSchema.safeParse(id).success) return { error: "That item no longer exists." };

  const parsed = collection.schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  try {
    const savedId = await saveContent(key, id, parsed.data, user.id, formData);
    await recordAudit(user.id, `${collection.audit}.${id ? "updated" : "created"}`, savedId, { title: parsed.data.title }, collection.audit);
    refresh(collection.publicPath, `/admin/${key}`);
  } catch (error) {
    if (error instanceof SaveError) return { error: error.message };
    return { error: "That couldn't be saved. Please try again." };
  }
  redirect(`/admin/${key}`);
}

export async function deleteContentAction(key: string, id: string): Promise<void> {
  if (!isCollection(key)) redirect("/admin");
  const collection = COLLECTIONS[key];
  const { user } = await requireRole(collection.roles as readonly Role[]);
  if (!projectIdSchema.safeParse(id).success) redirect(`/admin/${key}`);

  const title = await deleteContent(key, id);
  await recordAudit(user.id, `${collection.audit}.deleted`, id, { title }, collection.audit);
  refresh(collection.publicPath, `/admin/${key}`);
  redirect(`/admin/${key}`);
}

export async function saveAboutAction(_: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const { user } = await requireRole(["owner", "admin"]);
  const parsed = aboutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  try {
    await saveAbout(parsed.data, user.id, formData);
    await recordAudit(user.id, "about.updated", user.id, { title: "About me" }, "site_settings");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/profile");
  } catch (error) {
    if (error instanceof SaveError) return { error: error.message };
    return { error: "That couldn't be saved. Please try again." };
  }
  redirect("/admin/about?saved=1");
}
