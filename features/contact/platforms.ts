import type { BrandIconName } from "@/components/brand-icons";

// The kinds of contact link the manager portal offers. Shared by the portal
// form, the footer, the Contact page and the Contact me pop-up.
export const PLATFORMS = [
  ["email", "Email"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp"],
  ["discord", "Discord"],
  ["telegram", "Telegram"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["x", "X (Twitter)"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["snapchat", "Snapchat"],
  ["threads", "Threads"],
  ["website", "Website"],
  ["other", "Other link"],
] as const;

const BRANDS = new Set<string>(["whatsapp", "discord", "telegram", "linkedin", "github", "instagram", "tiktok", "x", "facebook", "youtube", "snapchat", "threads"]);

// A brand logo where there is one, otherwise a plain icon. Gmail addresses get the Gmail logo.
export function platformLogo(platform: string, url = ""): { brand: BrandIconName } | { icon: "mail" | "phone" | "globe" } {
  if (BRANDS.has(platform)) return { brand: platform as BrandIconName };
  if (platform === "email") return /@gmail\.com/i.test(url) ? { brand: "gmail" } : { icon: "mail" };
  if (platform === "phone") return { icon: "phone" };
  return { icon: "globe" };
}

export function platformName(platform: string) {
  return PLATFORMS.find(([value]) => value === platform)?.[1] ?? "Link";
}

export type ContactLink = { label: string | null; platform: string; url: string };

// Your email and phone from About me come first, then the links from Contact
// links. A link saved in both places is shown once.
export function contactLinks(about: { email?: string | null; phone?: string | null }, links: ContactLink[]): ContactLink[] {
  const own: ContactLink[] = [];
  if (about.email) own.push({ label: "Email", platform: "email", url: `mailto:${about.email}` });
  if (about.phone) own.push({ label: "Phone", platform: "phone", url: `tel:${about.phone.replace(/[^0-9+]/g, "")}` });
  const seen = new Set(own.map((link) => link.url.toLowerCase()));
  return [...own, ...links.filter((link) => !seen.has(link.url.toLowerCase()))];
}

// What a visitor sees for a link: the address or handle, not the raw URL.
export function linkHandle(url: string) {
  if (/^(mailto|tel):/i.test(url)) return decodeURIComponent(url.replace(/^(mailto|tel):/i, "").split("?")[0]);
  try {
    const { hostname, pathname } = new URL(url);
    const path = pathname.replace(/\/+$/, "");
    return hostname.replace(/^www\./, "") + path;
  } catch {
    return url;
  }
}
