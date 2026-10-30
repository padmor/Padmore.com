import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace this placeholder origin with the production domain before launch.
  const base = "https://your-domain.example";
  const routes = ["", "/about", "/projects", "/tutorials", "/store", "/hosted-apps", "/community", "/build-with-me", "/request-project", "/achievements", "/updates", "/contact"];
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.7 }));
}
