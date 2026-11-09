import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export type FollowState = { count: number; following: boolean };

// The number of people following, and whether this visitor is one of them.
export async function getFollowState(viewerId: string | null): Promise<FollowState> {
  const { rows } = await serverDb.execute<FollowState>(sql`
    select (select count(*)::int from public.site_followers) as count,
      exists (select 1 from public.site_followers where user_id = ${viewerId}::uuid) as following`);
  return { count: rows[0]?.count ?? 0, following: rows[0]?.following ?? false };
}
