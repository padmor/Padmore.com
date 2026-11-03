"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

const routeLabels: Array<{ prefix: string; label: string; hint: string }> = [
  { prefix: "/projects", label: "Projects", hint: "Explore selected work" },
  { prefix: "/tutorials", label: "Tutorials", hint: "Read practical guides" },
  { prefix: "/store", label: "Store", hint: "Browse digital products" },
  { prefix: "/build-with-me", label: "Build with me", hint: "Explore collaborations" },
  { prefix: "/request-project", label: "Project request", hint: "Share an idea" },
  { prefix: "/updates", label: "Latest updates", hint: "Follow the journey" },
  { prefix: "/contact", label: "Contact", hint: "Get in touch" },
];

export function WatchExperience() {
  const pathname = usePathname();
  const current = routeLabels.find((route) => pathname.startsWith(route.prefix));
  const title = current?.label ?? "Padmore Yeb";
  const hint = current?.hint ?? "Developer · Creator";

  return (
    <div className="watch-experience">
      <section className="watch-face" aria-label="Compact portfolio view">
        <div className="watch-brand"><span className="watch-mark">P</span><span>PADMORE</span></div>
        <div className="watch-divider" />
        <span className="watch-eyebrow">PERSONAL PORTFOLIO</span>
        <p className="watch-title">{title}</p>
        <p>{hint}</p>
        <span className="watch-current"><i /> Building and learning</span>
        <nav className="watch-actions" aria-label="Quick links">
          <Link href="/projects" aria-label="Projects"><Icon name="grid" size={14}/></Link>
          <Link href="/updates" aria-label="Updates"><Icon name="bell" size={14}/></Link>
          <Link href="/contact" aria-label="Contact"><Icon name="mail" size={14}/></Link>
        </nav>
      </section>
      <span className="watch-caption">Open on a larger screen for the full experience.</span>
    </div>
  );
}
