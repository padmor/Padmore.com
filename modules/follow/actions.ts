"use server";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";
import { getCurrentUser } from "@/lib/auth/session";
import { consumeRateLimit, type RateLimit } from "@/lib/security/rate-limit";
import { getFollowState, type FollowState } from "./repository";
import { recordEngagementEvent } from "@/modules/analytics/engagement";

const FOLLOW_LIMIT: RateLimit = { name: "site-follow", maxHits: 20, windowSeconds: 600 };

// Follows if the member is not following yet, and unfollows if they are.
export async function toggleFollowAction(): Promise<FollowState | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to follow." };
  if (!(await consumeRateLimit(FOLLOW_LIMIT, user.id))) return { error: "Please wait a few minutes and try again." };

  try {
    const removed = await serverDb.execute(sql`delete from public.site_followers where user_id = ${user.id}::uuid returning user_id`);
    if (removed.rows.length === 0) await serverDb.execute(sql`insert into public.site_followers (user_id) values (${user.id}::uuid) on conflict do nothing`);
    const state = await getFollowState(user.id);
    await recordEngagementEvent(state.following ? "follow_added" : "follow_removed", "/");
    return state;
  } catch {
    console.error("Follow failed");
    return { error: "Following is not available right now. Please try again later." };
  }
}
