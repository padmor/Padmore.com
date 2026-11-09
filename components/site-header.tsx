"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/data";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/features/store/providers/cart-provider";
import { BrandMark } from "@/components/brand-mark";

const moreLinks = [
  { label: "About me", href: "/about" },
  { label: "Live projects", href: "/hosted-apps" },
  { label: "Collaborate", href: "/build-with-me" },
  { label: "Start a project", href: "/request-project" },
  { label: "Achievements", href: "/achievements" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { count } = useCart();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const moreRef = useRef<HTMLDivElement>(null);

  // The More menu closes on a click outside it or on Escape, like a native menu.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (event: PointerEvent) => { if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMoreOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [moreOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Padmore Yeb homepage">
            <BrandMark/>
            <span>Padmore Yeb</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.slice(0, 5).map((item) => <Link key={item.href} href={item.href} className={isActive(item.href) ? "nav-link active" : "nav-link"} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
            <div className="nav-more-wrap" ref={moreRef}>
              <button type="button" className={moreLinks.some((item) => isActive(item.href)) ? "nav-link active" : "nav-link"} onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} aria-controls="nav-more-menu">More <Icon name="chevron" size={14}/></button>
              {moreOpen && <div className="nav-dropdown" id="nav-more-menu">{moreLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={isActive(item.href) ? "active" : undefined} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}</div>}
            </div>
          </nav>
          <div className="header-actions">
            <Link href="/projects" className="icon-button header-search" aria-label="Search projects"><Icon name="search" /></Link>
            <ThemeToggle />
            <Link href="/signin" className="button button-primary button-small sign-in-link">Sign in</Link>
            <Link href="/cart" className="icon-button cart-link" aria-label={`Shopping cart, ${count} items`}><Icon name="store" />{count > 0 && <span className="cart-count">{count}</span>}</Link>
            <button type="button" className="icon-button mobile-menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}><Icon name={open ? "close" : "menu"} /></button>
          </div>
        </div>
        {open && <nav className="mobile-menu" aria-label="Mobile navigation">{[...navItems.slice(0, 5), ...moreLinks].map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={isActive(item.href) ? "active" : ""}>{item.label}<Icon name="chevron" size={15}/></Link>)}</nav>}
      </header>
      <nav className="bottom-nav" aria-label="Quick navigation">
        <Link href="/" className={isActive("/") ? "active" : ""}><Icon name="home"/><span>Home</span></Link>
        <Link href="/projects" className={isActive("/projects") ? "active" : ""}><Icon name="grid"/><span>Projects</span></Link>
        <Link href="/tutorials" className={isActive("/tutorials") ? "active" : ""}><Icon name="book"/><span>Tutorials</span></Link>
        <Link href="/store" className={isActive("/store") ? "active" : ""}><Icon name="store"/><span>Store</span></Link>
        <Link href="/profile" className={isActive("/profile") ? "active" : ""}><Icon name="user"/><span>Profile</span></Link>
      </nav>
    </>
  );
}
