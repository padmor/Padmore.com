import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

// A first line of defence and session refresh only. Every private page and
// action still checks the session and role itself.
const protect = auth.middleware({ loginUrl: "/signin" });

export default async function proxy(request: NextRequest) {
  const response = await protect(request);

  // The community is public. A visitor without a session is let through instead of
  // being sent to sign in, but a member's session is still refreshed here, because a
  // page cannot refresh it while it renders.
  if (request.nextUrl.pathname.startsWith("/community") && response.headers.get("location")?.includes("/signin")) {
    const open = NextResponse.next();
    for (const cookie of response.headers.getSetCookie()) open.headers.append("Set-Cookie", cookie);
    return open;
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/community/:path*"],
};
