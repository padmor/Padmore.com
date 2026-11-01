import "server-only";
import { getSessionToken } from "@/lib/auth/server";
import { env } from "@/lib/environment/server";

// Runs as the signed-in user, so PostgreSQL RLS decides what they can reach.
// Returns null with no valid session, and never caches a private response.
export async function userDataApi(path: string, init: RequestInit = {}): Promise<Response | null> {
  const token = await getSessionToken();
  if (!token) return null;

  return fetch(`${env.NEON_DATA_API_URL}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
