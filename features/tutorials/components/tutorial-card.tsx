import Link from "next/link";
import type { Tutorial } from "@/lib/data";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";

export function TutorialArtwork({ visual }: { visual: Tutorial["visual"] }) {
  const symbols: Record<Tutorial["visual"], string> = { react: "✳", css: "▦", javascript: "JS", node: "N", git: "⌘", api: "↗" };
  return <div className={`tutorial-art tutorial-${visual}`} aria-hidden="true"><span className="tutorial-art-orb"/><strong>{symbols[visual]}</strong><i/><i/><i/></div>;
}

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return <article className="tutorial-card"><Link href={`/tutorials/${tutorial.slug}`} className="tutorial-image-link">{tutorial.imageId ? <SiteImage id={tutorial.imageId}/> : <TutorialArtwork visual={tutorial.visual}/>}</Link><div className="tutorial-card-content"><span className="eyebrow">{tutorial.category}</span><h3><Link href={`/tutorials/${tutorial.slug}`}>{tutorial.title}</Link></h3><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span><span>{tutorial.level}</span></div></div></article>;
}
