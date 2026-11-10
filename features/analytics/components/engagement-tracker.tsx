"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEngagement } from "@/lib/engagement/client";

const PRIVATE_PREFIXES = ["/admin", "/dashboard", "/profile", "/signin", "/signup", "/forgot-password", "/reset-password"];

export function EngagementTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (!pathname || PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEngagement("page_view", pathname);
  }, [pathname]);

  return null;
}
