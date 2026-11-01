import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { AUTH_IP_LIMIT, clientIp, consumeRateLimit } from "@/lib/security/rate-limit";

const handler = auth.handler();

export const GET = handler.GET;

// The server actions are not the only way in: this route is public, so it needs
// its own limit or attackers could skip the one on the sign-in form.
export async function POST(request: Parameters<typeof handler.POST>[0], context: Parameters<typeof handler.POST>[1]) {
  if (!(await consumeRateLimit(AUTH_IP_LIMIT, await clientIp()))) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }
  return handler.POST(request, context);
}
