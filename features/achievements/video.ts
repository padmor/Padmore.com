// Only YouTube and Vimeo links are accepted, and only their ids are kept, so a
// pasted link can never put another address in an embedded frame.
export type VideoRef = { provider: "youtube" | "vimeo"; id: string };

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{5,12}$/;

export function parseVideoUrl(input: string): VideoRef | null {
  let url: URL;
  try { url = new URL(input.trim()); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && YOUTUBE_ID.test(parts[0] ?? "")) return { provider: "youtube", id: parts[0] };
  if (YOUTUBE_HOSTS.has(host)) {
    const id = url.pathname === "/watch" ? url.searchParams.get("v") : (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null);
    if (id && YOUTUBE_ID.test(id)) return { provider: "youtube", id };
  }
  if (host === "vimeo.com" || host === "www.vimeo.com") {
    if (VIMEO_ID.test(parts[0] ?? "")) return { provider: "vimeo", id: parts[0] };
  }
  if (host === "player.vimeo.com" && parts[0] === "video" && VIMEO_ID.test(parts[1] ?? "")) return { provider: "vimeo", id: parts[1] };
  return null;
}

export const videoWatchUrl = ({ provider, id }: VideoRef) => provider === "youtube" ? `https://www.youtube.com/watch?v=${id}` : `https://vimeo.com/${id}`;
export const videoEmbedUrl = ({ provider, id }: VideoRef) => provider === "youtube" ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${id}?autoplay=1`;
