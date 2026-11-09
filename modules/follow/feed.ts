import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export type FeedItem = { kind: "tutorial" | "project" | "update"; title: string; href: string; at: string };

// When this member started following, or null if they are not following.
export async function getFollowedSince(userId: string): Promise<string | null> {
  const { rows } = await serverDb.execute<{ created_at: string | Date }>(sql`select created_at from public.site_followers where user_id = ${userId}::uuid`);
  return rows[0] ? new Date(rows[0].created_at).toISOString() : null;
}

// What has been published since the member started following: tutorials, projects and updates, newest first.
export async function listFollowFeed(since: string, limit = 8): Promise<FeedItem[]> {
  const [posts, projects] = await Promise.all([
    serverDb.execute<{ slug: string; title: string; content_type: string; published_at: string | Date }>(sql`
      select slug, title, content_type, published_at from public.posts
      where status = 'published' and published_at <= now() and published_at >= ${since}::timestamptz
        and content_type in ('tutorial', 'project_update', 'development_log', 'announcement', 'personal_thought')
      order by published_at desc limit ${limit}`),
    serverDb.execute<{ slug: string; title: string; published_at: string | Date }>(sql`
      select slug, title, published_at from public.projects
      where visibility = 'public' and lifecycle_status <> 'archived' and published_at <= now() and published_at >= ${since}::timestamptz
      order by published_at desc limit ${limit}`),
  ]);
  const items: FeedItem[] = [
    ...posts.rows.map((row): FeedItem => row.content_type === "tutorial"
      ? { kind: "tutorial", title: row.title, href: `/tutorials/${row.slug}`, at: new Date(row.published_at).toISOString() }
      : { kind: "update", title: row.title, href: "/updates", at: new Date(row.published_at).toISOString() }),
    ...projects.rows.map((row): FeedItem => ({ kind: "project", title: row.title, href: `/projects/${row.slug}`, at: new Date(row.published_at).toISOString() })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
