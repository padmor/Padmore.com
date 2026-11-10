import { z } from "zod";
import { clientIp, consumeRateLimit, type RateLimit } from "@/lib/security/rate-limit";
import { ENGAGEMENT_EVENTS, recordEngagementEvent } from "@/modules/analytics/engagement";

export const dynamic = "force-dynamic";

const EVENT_LIMIT: RateLimit = { name: "engagement-events", maxHits: 180, windowSeconds: 600 };
const schema = z.object({
  eventName: z.enum(ENGAGEMENT_EVENTS),
  pathname: z.string().min(1).max(240).regex(/^\/[A-Za-z0-9._~/%-]*$/),
  entitySlug: z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
}).strict();

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const allowed = await consumeRateLimit(EVENT_LIMIT, await clientIp());
  if (!allowed) return new Response(null, { status: 204 });

  await recordEngagementEvent(parsed.data.eventName, parsed.data.pathname, parsed.data.entitySlug);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
