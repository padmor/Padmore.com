import Image from "next/image";
import comingSoon from "@/features/content/assets/coming-soon.jpg";
import noCover from "@/features/content/assets/no-cover.jpg";

// Uploaded images come from the site's own /media route, already sized by the uploader.
export function SiteImage({ id, alt = "" }: { id: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="site-image" src={`/media/${id}`} alt={alt} loading="lazy"/>;
}

// Project stages that are still being built.
const BUILDING = new Set(["Idea", "Planning", "In Progress", "Testing", "Paused"]);
export const isUnderConstruction = (status?: string) => Boolean(status && BUILDING.has(status));

// Shown on any card whose item has no uploaded image yet: "Under construction"
// for work still being built, otherwise "No cover page yet". Static imports, so
// Next.js resizes them and serves a light version to each screen.
export function CoverImage({ id, alt = "", building = false }: { id?: string | null; alt?: string; building?: boolean }) {
  if (id) return <SiteImage id={id} alt={alt}/>;
  const [picture, note] = building ? [comingSoon, "under construction"] : [noCover, "no cover yet"];
  return <Image className="site-image" src={picture} alt={alt ? `${alt}, ${note}` : ""} sizes="(max-width: 700px) 92vw, 420px" placeholder="blur"/>;
}

export function Portrait({ photoId, sizes, className, priority }: { photoId?: string | null; sizes: string; className?: string; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (photoId) return <img className={`site-portrait ${className ?? ""}`} src={`/media/${photoId}`} alt="Padmore Yeb"/>;
  return <Image src="/images/portrait-reference-placeholder.webp" alt="Portrait" fill sizes={sizes} className={className} priority={priority}/>;
}
