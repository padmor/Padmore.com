import { BRAND_ICONS } from "@/components/brand-icons";
import { Icon } from "@/components/icon";
import { platformLogo } from "@/features/contact/platforms";

// The logo for a contact link, in the current text colour.
export function LinkIcon({ platform, url, size = 18 }: { platform: string; url?: string; size?: number }) {
  const logo = platformLogo(platform, url);
  if ("icon" in logo) return <Icon name={logo.icon} size={size}/>;
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={BRAND_ICONS[logo.brand].path}/></svg>;
}

// The brand colour behind a logo in the Contact me pop-up.
export function linkColour(platform: string, url?: string) {
  const logo = platformLogo(platform, url);
  if ("icon" in logo) return logo.icon === "phone" ? "var(--violet)" : "var(--primary)";
  return logo.brand === "snapchat" ? "#f5d800" : BRAND_ICONS[logo.brand].hex;
}
