import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export const SORTS = ["latest", "top", "discussed"] as const;
export type CommunitySort = (typeof SORTS)[number];
export const parseSort = (value: unknown): CommunitySort => SORTS.find((sort) => sort === value) ?? "latest";

export type CommunityReply = { id: string; userId: string; authorName: string; body: string; createdAt: string };
export type CommunityPost = {
  id: string;
  userId: string;
  authorName: string;
  title: string | null;
  body: string;
  createdAt: string;
  votes: number;
  voted: boolean;
  replies: CommunityReply[];
};

type PostRow = { id: string; user_id: string; author_name: string; title: string | null; body: string; created_at: string | Date; votes: number; voted: boolean };
type ReplyRow = { id: string; post_id: string; user_id: string; author_name: string; body: string; created_at: string | Date };

const iso = (value: string | Date) => new Date(value).toISOString();

// Everyone can read the community. `viewerId` only decides which posts show as upvoted.
export async function listCommunityPosts(viewerId: string | null, sort: CommunitySort = "latest", limit = 50): Promise<CommunityPost[]> {
  const order = sort === "top"
    ? sql`votes desc, p.created_at desc`
    : sort === "discussed"
      ? sql`reply_count desc, p.created_at desc`
      : sql`p.created_at desc`;

  const { rows: posts } = await serverDb.execute<PostRow>(sql`
    select p.id, p.user_id, p.author_name, p.title, p.body, p.created_at,
      (select count(*)::int from public.community_likes l where l.post_id = p.id) as votes,
      (select count(*)::int from public.community_replies r where r.post_id = p.id and r.status = 'published') as reply_count,
      exists (select 1 from public.community_likes l where l.post_id = p.id and l.user_id = ${viewerId}::uuid) as voted
    from public.community_posts p
    where p.status = 'published'
    order by ${order}
    limit ${limit}`);
  if (posts.length === 0) return [];

  const ids = sql.join(posts.map((post) => sql`${post.id}::uuid`), sql`, `);
  const { rows: replies } = await serverDb.execute<ReplyRow>(sql`
    select id, post_id, user_id, author_name, body, created_at
    from public.community_replies
    where status = 'published' and post_id in (${ids})
    order by created_at asc`);

  const byPost = new Map<string, CommunityReply[]>();
  for (const reply of replies) {
    const list = byPost.get(reply.post_id) ?? [];
    list.push({ id: reply.id, userId: reply.user_id, authorName: reply.author_name, body: reply.body, createdAt: iso(reply.created_at) });
    byPost.set(reply.post_id, list);
  }

  return posts.map((post) => ({
    id: post.id,
    userId: post.user_id,
    authorName: post.author_name,
    title: post.title,
    body: post.body,
    createdAt: iso(post.created_at),
    votes: post.votes,
    voted: post.voted,
    replies: byPost.get(post.id) ?? [],
  }));
}

export async function countCommunityMembers(): Promise<number> {
  const { rows } = await serverDb.execute<{ members: number }>(sql`select count(distinct user_id)::int as members from (select user_id from public.community_posts where status = 'published' union select user_id from public.community_replies where status = 'published') as authors`);
  return rows[0]?.members ?? 0;
}
