import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export type RateLimit = { name: string; maxHits: number; windowSeconds: number };

export const AUTH_IP_LIMIT: RateLimit = { name: "auth-ip", maxHits: 20, windowSeconds: 600 };
export const AUTH_ACCOUNT_LIMIT: RateLimit = { name: "auth-account", maxHits: 5, windowSeconds: 900 };

// Identifiers are hashed so that no email or IP address is stored in the table.
export async function consumeRateLimit(limit: RateLimit, identifier: string): Promise<boolean> {
  const hash = createHash("sha256").update(identifier.toLowerCase()).digest("hex");
  const bucket = `${limit.name}:${hash}`;
  try {
    const result = await serverDb.execute(
      sql`select app_private.consume_rate_limit(${bucket}, ${limit.maxHits}, ${limit.windowSeconds}) as allowed`,
    );
    return result.rows[0]?.allowed === true;
  } catch {
    // Without a working counter, fail closed rather than allow unlimited attempts.
    return false;
  }
}

// Vercel sets x-forwarded-for itself. A client-sent value is not trusted there.
export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
