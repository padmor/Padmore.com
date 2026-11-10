"use client";

import type { EngagementEventName } from "@/modules/analytics/engagement";

export function trackEngagement(
  eventName: EngagementEventName,
  pathname?: string,
  entitySlug?: string,
) {
  if (typeof window === "undefined" || window.navigator.doNotTrack === "1") return;

  const path = pathname ?? window.location.pathname;
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 240) return;

  const payload = {
    eventName,
    pathname: path.split("?")[0].split("#")[0],
    entitySlug: entitySlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entitySlug) ? entitySlug : undefined,
  };

  try {
    void fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  } catch {
    // Tracking is deliberately non-blocking.
  }
}
