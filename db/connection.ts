import "server-only";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/environment/server";

// A dropped connection ("fetch failed") would otherwise put an error page in
// front of every visitor. Reads are retried a few times; writes never are,
// because a write that reached the database before the connection dropped
// would then happen twice.
const READ_ATTEMPTS = 3;

function isReadOnly(body: unknown) {
  if (typeof body !== "string") return false;
  try {
    const parsed = JSON.parse(body) as { query?: string; queries?: { query: string }[] };
    const queries = parsed.queries?.map((item) => item.query) ?? (parsed.query ? [parsed.query] : []);
    return queries.length > 0 && queries.every((query) => /^\s*(select|with)\b/i.test(query) && !/\b(insert|update|delete)\b/i.test(query));
  } catch {
    return false;
  }
}

neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  const attempts = isReadOnly(init?.body) ? READ_ATTEMPTS : 1;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (attempt >= attempts) throw error;
      console.warn(`Database read failed to connect, retrying (${attempt} of ${attempts - 1})`);
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
};

// Trusted server work only, as the limited app_server role. Requests made on a
// signed-in user's behalf go through lib/db/data-api.ts so that RLS applies to
// that user. Neon rejects a user token on this direct connection.
export const serverDb = drizzle({ client: neon(env.DATABASE_SERVER_URL) });
