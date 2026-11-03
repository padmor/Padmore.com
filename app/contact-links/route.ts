import { contactLinks } from "@/features/contact/platforms";
import { getAbout, listSocialLinks } from "@/modules/content/repository";

// The Contact me pop-up asks for this each time it opens, so a link saved in
// the manager portal shows even on a page that was loaded earlier. Public data only.
export async function GET() {
  try {
    const [about, links] = await Promise.all([getAbout(), listSocialLinks()]);
    return Response.json(contactLinks(about, links), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Contact details are unavailable right now." }, { status: 503 });
  }
}
