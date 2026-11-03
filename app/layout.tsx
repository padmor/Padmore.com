import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WatchExperience } from "@/components/watch-experience";
import { CartProvider } from "@/features/store/providers/cart-provider";
import { env } from "@/lib/environment/server";
import "./globals.css";

export const metadata: Metadata = {
  // Makes link previews (WhatsApp, LinkedIn, X) use full addresses on the live site.
  metadataBase: new URL(env.APP_URL),
  title: { default: "Padmore Yeb — Developer Portfolio", template: "%s | Padmore Yeb" },
  description: "Explore Padmore Yeb's software projects, tutorials, development journey and collaboration opportunities.",
  applicationName: "Padmore Yeb Portfolio",
  openGraph: { title: "Padmore Yeb — Developer Portfolio", description: "Build · Learn · Collaborate · Grow", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" suppressHydrationWarning><body><CartProvider><WatchExperience/><SiteHeader/><main className="site-main">{children}</main><SiteFooter/></CartProvider></body></html>;
}
