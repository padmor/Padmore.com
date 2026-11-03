import type { MetadataRoute } from "next";
import { env } from "@/lib/environment/server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/signin", "/signup", "/cart"] },
    sitemap: `${env.APP_URL.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
