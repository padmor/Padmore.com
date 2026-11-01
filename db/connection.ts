import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/environment/server";

// Trusted server work only, as the limited app_server role. Requests made on a
// signed-in user's behalf go through lib/db/data-api.ts so that RLS applies to
// that user. Neon rejects a user token on this direct connection.
export const serverDb = drizzle({ client: neon(env.DATABASE_SERVER_URL) });
