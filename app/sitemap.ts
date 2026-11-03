import type { MetadataRoute } from "next";
import { env } from "@/lib/environment/server";
import { listPublicProducts, listPublicTutorials } from "@/modules/content/repository";
import { listPublicProjects } from "@/modules/portfolio/repository";

export const revalidate = 3600;

// Every public page, including each published project, tutorial and product.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.APP_URL.replace(/\/+$/, "");
  const routes = ["", "/about", "/projects", "/tutorials", "/store", "/hosted-apps", "/community", "/build-with-me", "/request-project", "/achievements", "/updates", "/contact"];
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.7 }));
  // A database problem leaves the main pages listed rather than failing the sitemap.
  const [projects, tutorials, products] = await Promise.all([
    listPublicProjects().catch(() => []),
    listPublicTutorials(500).catch(() => []),
    listPublicProducts().catch(() => []),
  ]);
  return [
    ...pages,
    ...projects.map((item) => ({ url: `${base}/projects/${item.slug}`, priority: 0.6 })),
    ...tutorials.map((item) => ({ url: `${base}/tutorials/${item.slug}`, priority: 0.6 })),
    ...products.map((item) => ({ url: `${base}/store/${item.slug}`, priority: 0.5 })),
  ];
}
