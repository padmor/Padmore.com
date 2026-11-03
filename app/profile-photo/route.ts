import { getAbout } from "@/modules/content/repository";

const FALLBACK = "/images/brand-mark.svg";

// The small round photo in the site logo. Points at the current profile image
// from About me, or the plain "P" mark until one is uploaded. Kept for five
// minutes, so most page views never reach the database.
export async function GET(request: Request) {
  const photoId = await getAbout().then((about) => about.photo_id).catch(() => null);
  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(photoId ? `/media/${photoId}` : FALLBACK, request.url).toString(),
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
