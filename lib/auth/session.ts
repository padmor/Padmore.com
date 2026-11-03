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
// A failed lookup is an error rather than "no roles": staff would otherwise get
// a false not-found page. It still fails closed, since the error stops the page.
async function fetchRoles(): Promise<Role[]> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await userDataApi("user_roles?select=role");
    if (response?.ok) {
      const rows: { role: Role }[] = await response.json();
      return rows.map((row) => row.role);
    }
    console.error(`Role lookup failed: ${response?.status ?? "no token"}, attempt ${attempt}`);
  }
  throw new Error("Role lookup failed");
}

export const getCurrentRoles = cache(fetchRoles);

// Shows the not-found page rather than a 403, so private areas do not reveal that
// they exist. The root loading.tsx streams, so the HTTP status can still be 200,
// but this runs before anything private is rendered.
export async function requireRole(allowed: readonly Role[]) {
  const user = await requireUser();
  let roles = await getCurrentRoles();
  if (!roles.some((role) => allowed.includes(role))) {
    // A token for another or expired session makes the database see no roles.
    // That is a stale sign-in rather than a missing permission, so ask to sign in again.
    if (await tokenIsStale(user.id)) redirect("/signin");
    // The Data API has now and then answered a valid staff token with no roles.
    // Asking again before the not-found page stops staff being shut out by that.
    for (let attempt = 1; attempt <= 2 && !roles.some((role) => allowed.includes(role)); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      roles = await fetchRoles();
      if (roles.length) console.warn(`Role lookup returned no roles, then found them on retry ${attempt}`);
    }
    if (!roles.some((role) => allowed.includes(role))) notFound();
  }
  return { user, roles };
}

// Reads only the token's subject and expiry for this comparison. The Data API
// verifies the signature itself, so nothing here is trusted for access.
async function tokenIsStale(userId: string) {
  const token = await getSessionToken();
  try {
    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString("utf8")) as { sub?: string; exp?: number };
    const expired = typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
    if (payload.sub !== userId || expired) {
      console.warn(`Stale session token: ${payload.sub !== userId ? "belongs to another account" : "expired"}`);
      return true;
    }
    console.warn("Signed-in account has no portal role");
    return false;
  } catch {
    console.warn("Session token could not be read");
    return true;
  }
}
