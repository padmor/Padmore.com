"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export type RecentItemKind = "project" | "tutorial" | "product";
export type RecentItem = {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  viewedAt: string;
};

const STORAGE_KEY = "padmore-recently-viewed-v1";
const EVENT_NAME = "padmore:recently-viewed";

export function rememberRecentlyViewed(item: Omit<RecentItem, "viewedAt">) {
  if (typeof window === "undefined" || window.navigator.doNotTrack === "1") return;

  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const existing: RecentItem[] = Array.isArray(current) ? current.filter((entry) =>
      entry && typeof entry.slug === "string" && typeof entry.href === "string"
    ) : [];
    const next: RecentItem[] = [
      { ...item, viewedAt: new Date().toISOString() },
      ...existing.filter((entry) => !(entry.kind === item.kind && entry.slug === item.slug)),
    ].slice(0, 8);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Browsing should remain functional when local storage is unavailable.
  }
}

export function RecentlyViewedLink({
  kind,
  slug,
  title,
  href,
  className,
  children,
  onClick,
}: {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => { rememberRecentlyViewed({ kind, slug, title, href }); onClick?.(); }}
    >
      {children}
    </Link>
  );
}

function isSafeRecentItem(item: unknown): item is RecentItem {
  if (!item || typeof item !== "object") return false;
  const value = item as Partial<RecentItem>;
  if (!["project", "tutorial", "product"].includes(value.kind ?? "")) return false;
  if (typeof value.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) return false;
  if (typeof value.title !== "string" || value.title.length > 200) return false;
  if (typeof value.viewedAt !== "string" || Number.isNaN(Date.parse(value.viewedAt))) return false;
  const expected = value.kind === "project"
    ? new RegExp(`^/(?:projects|work)/${value.slug}"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export type RecentItemKind = "project" | "tutorial" | "product";
export type RecentItem = {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  viewedAt: string;
};

const STORAGE_KEY = "padmore-recently-viewed-v1";
const EVENT_NAME = "padmore:recently-viewed";

export function rememberRecentlyViewed(item: Omit<RecentItem, "viewedAt">) {
  if (typeof window === "undefined" || window.navigator.doNotTrack === "1") return;

  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const existing: RecentItem[] = Array.isArray(current) ? current.filter((entry) =>
      entry && typeof entry.slug === "string" && typeof entry.href === "string"
    ) : [];
    const next: RecentItem[] = [
      { ...item, viewedAt: new Date().toISOString() },
      ...existing.filter((entry) => !(entry.kind === item.kind && entry.slug === item.slug)),
    ].slice(0, 8);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Browsing should remain functional when local storage is unavailable.
  }
}

export function RecentlyViewedLink({
  kind,
  slug,
  title,
  href,
  className,
  children,
  onClick,
}: {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => { rememberRecentlyViewed({ kind, slug, title, href }); onClick?.(); }}
    >
      {children}
    </Link>
  );
}

)
    : new RegExp(`^/${value.kind === "tutorial" ? "tutorials" : "store"}/${value.slug}"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export type RecentItemKind = "project" | "tutorial" | "product";
export type RecentItem = {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  viewedAt: string;
};

const STORAGE_KEY = "padmore-recently-viewed-v1";
const EVENT_NAME = "padmore:recently-viewed";

export function rememberRecentlyViewed(item: Omit<RecentItem, "viewedAt">) {
  if (typeof window === "undefined" || window.navigator.doNotTrack === "1") return;

  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const existing: RecentItem[] = Array.isArray(current) ? current.filter((entry) =>
      entry && typeof entry.slug === "string" && typeof entry.href === "string"
    ) : [];
    const next: RecentItem[] = [
      { ...item, viewedAt: new Date().toISOString() },
      ...existing.filter((entry) => !(entry.kind === item.kind && entry.slug === item.slug)),
    ].slice(0, 8);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Browsing should remain functional when local storage is unavailable.
  }
}

export function RecentlyViewedLink({
  kind,
  slug,
  title,
  href,
  className,
  children,
  onClick,
}: {
  kind: RecentItemKind;
  slug: string;
  title: string;
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => { rememberRecentlyViewed({ kind, slug, title, href }); onClick?.(); }}
    >
      {children}
    </Link>
  );
}

);
  return typeof value.href === "string" && expected.test(value.href);
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        setItems(Array.isArray(stored) ? stored.filter(isSafeRecentItem).slice(0, 8) : []);
      } catch {
        setItems([]);
      }
      setReady(true);
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(EVENT_NAME, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(EVENT_NAME, refresh);
    };
  }, []);

  function clear() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* optional convenience */ }
    setItems([]);
  }

  if (!ready) return null;

  return (
    <section className="dashboard-box recently-viewed-box" aria-labelledby="recently-viewed-heading">
      <div className="section-heading">
        <div>
          <h2 id="recently-viewed-heading">Recently viewed</h2>
          <p>Pick up where you left off on this device.</p>
        </div>
        {items.length > 0 && <button type="button" className="catalog-clear" onClick={clear}>Clear history</button>}
      </div>
      {items.length > 0 ? (
        <ul className="dashboard-link-list">
          {items.map((item) => (
            <li key={`${item.kind}:${item.slug}`}>
              <Link href={item.href} className="dashboard-item-link">
                <span className="dashboard-item-icon">
                  <Icon name={item.kind === "tutorial" ? "book" : item.kind === "product" ? "store" : "grid"}/>
                </span>
                <span className="dashboard-item-copy">
                  <strong>{item.title}</strong>
                  <small>{item.kind[0].toUpperCase() + item.kind.slice(1)} · viewed {new Date(item.viewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small>
                </span>
                <Icon name="arrow" size={15}/>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="dashboard-empty compact-empty">
          <p>Projects, tutorials and products you open will appear here for quick access on this device.</p>
          <Link className="text-link" href="/projects">Explore projects →</Link>
        </div>
      )}
    </section>
  );
}
