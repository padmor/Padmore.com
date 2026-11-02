import Image from "next/image";

// Uploaded images come from the site's own /media route, already sized by the uploader.
export function SiteImage({ id, alt = "" }: { id: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="site-image" src={`/media/${id}`} alt={alt} loading="lazy"/>;
}

export function Portrait({ photoId, sizes, className, priority }: { photoId?: string | null; sizes: string; className?: string; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (photoId) return <img className={`site-portrait ${className ?? ""}`} src={`/media/${photoId}`} alt="Padmore Yeb"/>;
  return <Image src="/images/portrait-reference-placeholder.webp" alt="Portrait" fill sizes={sizes} className={className} priority={priority}/>;
}
