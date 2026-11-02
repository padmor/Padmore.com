import "server-only";
import { and, desc, eq, inArray, lte, ne, sql } from "drizzle-orm";
import { serverDb } from "@/db/connection";
import { opportunities, posts, products, siteSettings, socialLinks } from "@/db/schema/schema";
import type { Product, Tutorial } from "@/lib/data";
import type { AboutContent } from "@/modules/admin/collections";
import { DEFAULT_ABOUT } from "./defaults";

const LIST_LIMIT = 100;

// RLS enforces these as well. Stating them here keeps the rules visible in the query.
const isLivePost = and(eq(posts.status, "published"), lte(posts.publishedAt, sql`now()`));
const isLiveProduct = and(eq(products.status, "published"), lte(products.publishedAt, sql`now()`));

type TutorialJson = { body?: string; category?: string; level?: string; minutes?: number; artwork?: string; video_url?: string | null };
const TUTORIAL_ARTWORK = new Set(["react", "css", "javascript", "node", "git", "api"]);
const PRODUCT_ARTWORK = new Set(["design", "toolkit", "react", "bundle"]);

const postColumns = { slug: posts.slug, title: posts.title, excerpt: posts.excerpt, contentJson: posts.contentJson, imageId: posts.imageId };

function toTutorial(row: { slug: string; title: string; excerpt: string | null; contentJson: unknown; imageId: string | null }): Tutorial {
  const json = row.contentJson as TutorialJson;
  return {
    slug: row.slug,
    title: row.title,
    description: row.excerpt ?? "",
    category: json.category ?? "Other",
    level: json.level ?? "Beginner",
    minutes: json.minutes ?? 1,
    visual: (TUTORIAL_ARTWORK.has(json.artwork ?? "") ? json.artwork : "react") as Tutorial["visual"],
    body: json.body ?? "",
    videoUrl: json.video_url ?? undefined,
    imageId: row.imageId ?? undefined,
  };
}

export async function listPublicTutorials(limit = LIST_LIMIT) {
  const rows = await serverDb
    .select(postColumns)
    .from(posts)
    .where(and(isLivePost, eq(posts.contentType, "tutorial")))
    .orderBy(desc(posts.publishedAt))
    .limit(Math.min(limit, LIST_LIMIT));
  return rows.map(toTutorial);
}

export async function getPublicTutorial(slug: string) {
  const rows = await serverDb
    .select(postColumns)
    .from(posts)
    .where(and(isLivePost, eq(posts.contentType, "tutorial"), eq(posts.slug, slug)))
    .limit(1);
  return rows[0] ? toTutorial(rows[0]) : null;
}

const UPDATE_LABELS: Record<string, string> = {
  project_update: "Project update",
  development_log: "Build log",
  announcement: "Announcement",
  personal_thought: "Learning note",
};

export async function listPublicUpdates() {
  const rows = await serverDb
    .select({ ...postColumns, contentType: posts.contentType, publishedAt: posts.publishedAt })
    .from(posts)
    .where(and(isLivePost, inArray(posts.contentType, Object.keys(UPDATE_LABELS))))
    .orderBy(desc(posts.publishedAt))
    .limit(LIST_LIMIT);
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    type: UPDATE_LABELS[row.contentType],
    text: (row.contentJson as TutorialJson).body ?? "",
    imageId: row.imageId,
    date: new Date(row.publishedAt!).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" }),
  }));
}

const productColumns = {
  slug: products.slug,
  title: products.title,
  description: products.description,
  category: products.category,
  artwork: products.artwork,
  license: products.license,
  productType: products.productType,
  priceAmountMinor: products.priceAmountMinor,
  imageId: products.imageId,
};

function toProduct(row: { slug: string; title: string; description: string | null; category: string | null; artwork: string; license: string | null; productType: string; priceAmountMinor: number | null; imageId: string | null }): Product {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    category: row.category ?? "Other",
    visual: (PRODUCT_ARTWORK.has(row.artwork) ? row.artwork : "toolkit") as Product["visual"],
    license: row.license ?? undefined,
    type: row.productType === "service" ? "Service" : "Digital download",
    imageId: row.imageId ?? undefined,
    price: Number(row.priceAmountMinor ?? 0) / 100,
  };
}

export async function listPublicProducts() {
  const rows = await serverDb.select(productColumns).from(products).where(isLiveProduct).orderBy(desc(products.publishedAt)).limit(LIST_LIMIT);
  return rows.map(toProduct);
}

export async function getPublicProduct(slug: string) {
  const rows = await serverDb.select(productColumns).from(products).where(and(isLiveProduct, eq(products.slug, slug))).limit(1);
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function listOpenOpportunities() {
  return serverDb
    .select({ id: opportunities.id, title: opportunities.title, description: opportunities.description, area: opportunities.area, commitment: opportunities.commitment, arrangement: opportunities.arrangement, imageId: opportunities.imageId })
    .from(opportunities)
    .where(eq(opportunities.isOpen, true))
    .orderBy(desc(opportunities.createdAt))
    .limit(LIST_LIMIT);
}

export async function listSocialLinks() {
  return serverDb
    .select({ label: socialLinks.label, platform: socialLinks.platform, url: socialLinks.url })
    .from(socialLinks)
    .where(eq(socialLinks.isVisible, true))
    .orderBy(socialLinks.sortOrder, socialLinks.createdAt)
    .limit(20);
}

export async function getAbout(): Promise<AboutContent> {
  const rows = await serverDb
    .select({ value: siteSettings.settingValue })
    .from(siteSettings)
    .where(and(eq(siteSettings.settingKey, "about"), eq(siteSettings.isPublic, true), ne(siteSettings.settingValue, sql`'{}'::jsonb`)))
    .limit(1);
  return (rows[0]?.value as AboutContent | undefined) ?? DEFAULT_ABOUT;
}
