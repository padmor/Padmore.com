import { getCurrentUser } from "@/lib/auth/session";
import { listSavedKeys } from "@/modules/saved/repository";

// Read on the page after it loads, so pages with Save buttons stay cached for
// everyone and only this small answer is specific to the visitor.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  const headers = { "Cache-Control": "no-store" };
  if (!user) return Response.json({ signedIn: false, items: [] }, { headers });
  try {
    return Response.json({ signedIn: true, items: await listSavedKeys(user.id) }, { headers });
  } catch {
    // Until the table exists a member can still sign in; saving just says it is unavailable.
    return Response.json({ signedIn: true, items: [], unavailable: true }, { headers });
  }
}
