import { getCurrentUser } from "@/lib/auth/session";
import { getFollowState } from "@/modules/follow/repository";

// Read on the page after it loads, so the pages that show the Follow button stay
// cached for everyone and only this small answer is specific to the visitor.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  const headers = { "Cache-Control": "no-store" };
  try {
    return Response.json({ ...(await getFollowState(user?.id ?? null)), signedIn: Boolean(user) }, { headers });
  } catch {
    // Until the followers table exists the button still shows, and says so when pressed.
    return Response.json({ count: 0, following: false, signedIn: Boolean(user), unavailable: true }, { headers });
  }
}
