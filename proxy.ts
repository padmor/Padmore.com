import { auth } from "@/lib/auth/server";

// A first line of defence and session refresh only. Every private page and
// action still checks the session and role itself.
export default auth.middleware({ loginUrl: "/signin" });

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
