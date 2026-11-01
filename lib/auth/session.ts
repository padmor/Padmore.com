import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth, getSessionToken } from "@/lib/auth/server";
import { userDataApi } from "@/lib/db/data-api";

export type Role = "owner" | "admin" | "editor" | "support";

// getSession alone trusts a signed cookie that stays valid for minutes, so a copied
// cookie could outlive sign-out. The fresh token check is what catches revocation.
export const getCurrentUser = cache(async () => {
  const [{ data }, token] = await Promise.all([auth.getSession(), getSessionToken()]);
  if (!data?.user || !token) return null;
  return { id: data.user.id, name: data.user.name, email: data.user.email };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

// Read fresh from the database on every request. Never from the JWT or the
// client, so removing a role takes effect immediately.
export const getCurrentRoles = cache(async (): Promise<Role[]> => {
  const response = await userDataApi("user_roles?select=role");
  if (!response?.ok) return [];
  const rows: { role: Role }[] = await response.json();
  return rows.map((row) => row.role);
});

// Shows the not-found page rather than a 403, so private areas do not reveal that
// they exist. The root loading.tsx streams, so the HTTP status can still be 200,
// but this runs before anything private is rendered.
export async function requireRole(allowed: readonly Role[]) {
  const user = await requireUser();
  const roles = await getCurrentRoles();
  if (!roles.some((role) => allowed.includes(role))) notFound();
  return { user, roles };
}
