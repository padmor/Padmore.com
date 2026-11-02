"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { userDataApi } from "@/lib/db/data-api";
import { recordAudit } from "./repository";

const statusSchema = z.enum(["new", "reviewing", "in_discussion", "accepted", "declined", "completed", "closed"]);

// RLS limits this to owners, admins and support as well.
export async function updateInquiryStatusAction(id: string, formData: FormData): Promise<void> {
  const { user } = await requireRole(["owner", "admin", "support"]);
  const status = statusSchema.safeParse(formData.get("status"));
  if (!z.uuid().safeParse(id).success || !status.success) return;
  const response = await userDataApi(`inquiries?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: status.data }) });
  if (!response?.ok) return;
  await recordAudit(user.id, "enquiry.updated", id, { title: status.data.replaceAll("_", " ") }, "inquiry");
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
}
