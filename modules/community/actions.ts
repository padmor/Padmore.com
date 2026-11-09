"use server";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { serverDb } from "@/db/connection";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { consumeRateLimit, type RateLimit } from "@/lib/security/rate-limit";

export type CommunityFormState = { error?: string; sent?: number };

const POST_LIMIT: RateLimit = { name: "community-post", maxHits: 8, windowSeconds: 600 };
const REPLY_LIMIT: RateLimit = { name: "community-reply", maxHits: 20, windowSeconds: 600 };
const VOTE_LIMIT: RateLimit = { name: "community-like", maxHits: 60, windowSeconds: 600 };

const SIGN_IN = "Please sign in to take part.";
const BUSY = "You are posting quickly. Please wait a few minutes and try again.";
const FAILED = "That could not be saved. Please try again.";

const id = z.uuid();
const postTitle = z.string().trim().min(1, "Add a title.").max(150, "Keep the title under 150 characters.");
const postBody = z.string().trim().min(1, "Add some details.").max(2000, "Keep your post under 2,000 characters.");
const replyBody = z.string().trim().min(1, "Write a reply first.").max(1000, "Keep your reply under 1,000 characters.");

// The name is copied onto the post, so reading the community never needs the user table.
const displayName = (user: { name: string; email: string }) => user.name.trim() || user.email.split("@")[0];

async function canModerate() {
  try {
    const roles = await getCurrentRoles();
    return roles.includes("owner") || roles.includes("admin");
  } catch {
    return false;
  }
}

function refresh() {
  revalidatePath("/community");
}

export async function createPostAction(_: CommunityFormState, formData: FormData): Promise<CommunityFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: SIGN_IN };
  const title = postTitle.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0]?.message };
  const body = postBody.safeParse(formData.get("body"));
  if (!body.success) return { error: body.error.issues[0]?.message };
  if (!(await consumeRateLimit(POST_LIMIT, user.id))) return { error: BUSY };

  try {
    await serverDb.execute(sql`insert into public.community_posts (user_id, author_name, title, body) values (${user.id}::uuid, ${displayName(user)}, ${title.data}, ${body.data})`);
  } catch {
    console.error("Community post failed");
    return { error: FAILED };
  }
  refresh();
  return { sent: Date.now() };
}

export async function createReplyAction(_: CommunityFormState, formData: FormData): Promise<CommunityFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: SIGN_IN };
  const postId = id.safeParse(formData.get("postId"));
  const parsed = replyBody.safeParse(formData.get("body"));
  if (!postId.success) return { error: FAILED };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!(await consumeRateLimit(REPLY_LIMIT, user.id))) return { error: BUSY };

  try {
    // Only replies to a post that is still showing are accepted.
    const result = await serverDb.execute(sql`
      insert into public.community_replies (post_id, user_id, author_name, body)
      select p.id, ${user.id}::uuid, ${displayName(user)}, ${parsed.data}
      from public.community_posts p where p.id = ${postId.data}::uuid and p.status = 'published'
      returning id`);
    if (result.rows.length === 0) return { error: "That post is no longer available." };
  } catch {
    console.error("Community reply failed");
    return { error: FAILED };
  }
  refresh();
  return { sent: Date.now() };
}

// Adds the upvote if it is missing and removes it if it is there.
export async function toggleVoteAction(postIdInput: string): Promise<{ voted: boolean; votes: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: SIGN_IN };
  const postId = id.safeParse(postIdInput);
  if (!postId.success) return { error: FAILED };
  if (!(await consumeRateLimit(VOTE_LIMIT, user.id))) return { error: BUSY };

  try {
    const removed = await serverDb.execute(sql`delete from public.community_likes where post_id = ${postId.data}::uuid and user_id = ${user.id}::uuid returning post_id`);
    if (removed.rows.length === 0) {
      await serverDb.execute(sql`
        insert into public.community_likes (post_id, user_id)
        select p.id, ${user.id}::uuid from public.community_posts p where p.id = ${postId.data}::uuid and p.status = 'published'
        on conflict do nothing`);
    }
    const { rows } = await serverDb.execute<{ votes: number; voted: boolean }>(sql`
      select count(*)::int as votes, coalesce(bool_or(user_id = ${user.id}::uuid), false) as voted
      from public.community_likes where post_id = ${postId.data}::uuid`);
    refresh();
    return { voted: rows[0]?.voted ?? false, votes: rows[0]?.votes ?? 0 };
  } catch {
    console.error("Community vote failed");
    return { error: FAILED };
  }
}

// A member can remove their own post. The site owner and admins can remove any.
export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const postId = id.safeParse(formData.get("postId"));
  if (!user || !postId.success) return;
  const staff = await canModerate();
  await serverDb.execute(sql`delete from public.community_posts where id = ${postId.data}::uuid and (user_id = ${user.id}::uuid or ${staff})`).catch(() => console.error("Community delete failed"));
  refresh();
}

export async function deleteReplyAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const replyId = id.safeParse(formData.get("replyId"));
  if (!user || !replyId.success) return;
  const staff = await canModerate();
  await serverDb.execute(sql`delete from public.community_replies where id = ${replyId.data}::uuid and (user_id = ${user.id}::uuid or ${staff})`).catch(() => console.error("Community delete failed"));
  refresh();
}
