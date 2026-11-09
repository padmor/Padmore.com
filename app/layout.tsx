import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/features/store/providers/cart-provider";
import { AuthPromptProvider } from "@/features/community/components/auth-prompt";
import { env } from "@/lib/environment/server";
import { Geist } from "next/font/google";
import "./tailwind.css";
import "./globals.css";

// Display face for Tailwind-built sections (font-display). Self-hosted by next/font.
const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });

export const metadata: Metadata = {
  // Makes link previews (WhatsApp, LinkedIn, X) use full addresses on the live site.
  metadataBase: new URL(env.APP_URL),
  title: { default: "Padmore Yeb — Web & Mobile Application Developer", template: "%s | Padmore Yeb" },
  description: "Portfolio of Padmore Yeb, a web and mobile application developer in Ghana: projects, tutorials, certifications and contact details.",
  applicationName: "Padmore Yeb Portfolio",
  openGraph: { title: "Padmore Yeb — Web & Mobile Application Developer", description: "Projects, tutorials and contact details for Padmore Yeb, a web and mobile application developer in Ghana.", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" className={geist.variable} suppressHydrationWarning><body><CartProvider><AuthPromptProvider><SiteHeader/><main className="site-main">{children}</main><SiteFooter/></AuthPromptProvider></CartProvider></body></html>;
}
