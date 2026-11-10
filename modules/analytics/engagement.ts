import "server-only";
import { sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";

export const ENGAGEMENT_EVENTS = [
  "page_view",
  "project_open",
  "tutorial_open",
  "product_open",
  "follow_click",
  "follow_added",
  "follow_removed",
  "signup_completed",
  "newsletter_subscribed",
  "project_request_submitted",
  "collaboration_submitted",
  "cart_added",
  "save_added",
  "save_removed",
  "community_post_attempt",
] as const;

export type EngagementEventName = (typeof ENGAGEMENT_EVENTS)[number];

const PATH = /^\/[A-Za-z0-9._~/%-]*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function recordEngagementEvent(
  eventName: EngagementEventName,
  pathname: string,
  entitySlug?: string | null,
): Promise<boolean> {
  if (!PATH.test(pathname) || pathname.length > 240) return false;
  if (entitySlug && (!SLUG.test(entitySlug) || entitySlug.length > 120)) return false;

  try {
    await serverDb.execute(sql`
      insert into public.site_engagement_events (event_name, pathname, entity_slug)
      values (${eventName}, ${pathname}, ${entitySlug || null})
    `);
    return true;
  } catch {
    // Analytics must never block a page, form submission or member action.
    return false;
  }
}

export type EngagementSnapshot = {
  available: boolean;
  counts: Record<EngagementEventName, number>;
  topPages: { pathname: string; views: number }[];
};

const emptyCounts = (): Record<EngagementEventName, number> =>
  Object.fromEntries(ENGAGEMENT_EVENTS.map((event) => [event, 0])) as Record<EngagementEventName, number>;

export async function getEngagementSnapshot(): Promise<EngagementSnapshot> {
  try {
    const [events, pages] = await Promise.all([
      serverDb.execute<{ event_name: EngagementEventName; total: number | string }>(sql`
        select event_name, count(*)::int as total
        from public.site_engagement_events
        where created_at >= now() - interval '30 days'
        group by event_name
      `),
      serverDb.execute<{ pathname: string; views: number | string }>(sql`
        select pathname, count(*)::int as views
        from public.site_engagement_events
        where event_name = 'page_view'
          and created_at >= now() - interval '30 days'
        group by pathname
        order by views desc, pathname asc
        limit 8
      `),
    ]);

    const counts = emptyCounts();
    for (const row of events.rows) {
      if (row.event_name in counts) counts[row.event_name] = Number(row.total) || 0;
    }

    return {
      available: true,
      counts,
      topPages: pages.rows.map((row) => ({ pathname: row.pathname, views: Number(row.views) || 0 })),
    };
  } catch {
    return { available: false, counts: emptyCounts(), topPages: [] };
  }
}
