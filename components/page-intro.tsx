import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{action && <div className="page-intro-action">{action}</div>}</div>;
}

export function SectionHeading({ title, description, href, linkLabel = "View all" }: { title: string; description?: string; href?: string; linkLabel?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{href && <Link href={href} className="button button-outline button-small section-heading-action">{linkLabel}<Icon name="arrow" size={15}/></Link>}</div>;
}
