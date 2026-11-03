import Link from "next/link";
import type { Tutorial } from "@/lib/data";
import { CoverImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return <article className="tutorial-card"><Link href={`/tutorials/${tutorial.slug}`} className="tutorial-image-link"><CoverImage id={tutorial.imageId}/></Link><div className="tutorial-card-content"><span className="eyebrow">{tutorial.category}</span><h3><Link href={`/tutorials/${tutorial.slug}`}>{tutorial.title}</Link></h3><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span><span>{tutorial.level}</span></div></div></article>;
}
