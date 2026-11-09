"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/features/store/providers/cart-provider";
import { FollowButton } from "@/features/follow/components/follow-button";
import { BrandMark } from "@/components/brand-mark";

const primaryNavItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const moreLinks = [
  { label: "Store", href: "/store" },
  { label: "Live projects", href: "/hosted-apps" },
  { label: "Collaborate", href: "/build-with-me" },
  { label: "Start a project", href: "/request-project" },
  { label: "Achievements", href: "/achievements" },
  { label: "Contact", href: "/contact" },
  { label: "Sign in", href: "/signin" },
  { label: "Shopping cart", href: "/cart" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Padmore Yeb homepage">
            <BrandMark />
            <span>Padmore Yeb</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "nav-link active" : "nav-link"}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/projects" className="icon-button header-search" aria-label="Browse projects">
              <Icon name="search" />
            </Link>
            <ThemeToggle />
            <FollowButton compact />
            <Link href="/request-project" className="button button-primary header-hire-link">
              <Icon name="send" size={16} /> Hire Me
            </Link>
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>

        {open && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {[...primaryNavItems, ...moreLinks].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={isActive(item.href) ? "active" : ""}
              >
                {item.label === "Shopping cart" && count > 0 ? item.label + " (" + count + ")" : item.label}
                <Icon name="chevron" size={15} />
              </Link>
            ))}
          </nav>
        )}
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
