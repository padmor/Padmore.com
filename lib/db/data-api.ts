import "server-only";
import { getSessionToken } from "@/lib/auth/server";
import { env } from "@/lib/environment/server";

// After a migration, some Data API instances keep an out-of-date picture of the
// tables for a while, so the same request can fail on one and work on the next.
const STALE_SCHEMA_CODES = new Set(["PGRST204", "PGRST205"]);
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 300;

// Runs as the signed-in user, so PostgreSQL RLS decides what they can reach.
// Returns null with no valid session, and never caches a private response.
export async function userDataApi(path: string, init: RequestInit = {}): Promise<Response | null> {
  const token = await getSessionToken();
  if (!token) return null;

  // Only reads are retried after a dropped connection; a write might already have happened.
  const isRead = !init.method || init.method.toUpperCase() === "GET";
  for (let attempt = 1; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${env.NEON_DATA_API_URL}/${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (!isRead || attempt >= 3) throw error;
      console.warn(`Data API read failed to connect, retrying (${attempt} of 2)`);
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      continue;
    }
    if (response.ok || attempt === MAX_ATTEMPTS) return response;

    const body = await response.clone().json().catch(() => ({}));
    if (!STALE_SCHEMA_CODES.has(body.code)) return response;
    console.warn(`Data API schema out of date (${body.code}), attempt ${attempt} of ${MAX_ATTEMPTS}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}
