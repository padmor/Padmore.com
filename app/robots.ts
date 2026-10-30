import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/signin", "/signup", "/cart"] },
    sitemap: "https://your-domain.example/sitemap.xml",
  };
}
