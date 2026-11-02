import "server-only";
import { userDataApi } from "@/lib/db/data-api";
import { discardImage, withImage } from "./images";
import { SaveError } from "./save-error";
import type { AboutContent, CollectionKey } from "./collections";

// As with projects, everything runs as the signed-in staff member, so RLS has
// the final say on who may read or change each table.

type Values = Record<string, unknown>;
export type ContentItem = { id: string; heading: string; status: string; note: string; updatedAt: string; values: Values };

type Row = Values & { id: string; updated_at: string };
type Mapping = {
  table: string;
  filter?: string;
  select: string;
  order?: string;
  toItem: (row: Row) => Omit<ContentItem, "id" | "updatedAt">;
  toRow: (input: Values, userId: string, current: Row | null) => Values;
  titleColumn?: string;
};

const UPDATE_FILTER = "content_type=in.(project_update,development_log,announcement,personal_thought)";
const POST_SELECT = "id,title,slug,excerpt,content_type,content_json,image_id,status,published_at,updated_at";
const shown = (visible: unknown) => (visible ? "published" : "draft");

// Publish time is set once, so a later edit doesn't reorder the site.
const publishedAt = (status: unknown, current: Row | null) =>
  status === "published" && !current?.published_at ? new Date().toISOString() : (current?.published_at ?? null);

const MAPPINGS: Record<CollectionKey, Mapping> = {
  links: {
    table: "social_links",
    titleColumn: "label",
    select: "id,label,platform,url,is_visible,updated_at",
    toItem: (row) => ({
      heading: String(row.label),
      status: shown(row.is_visible),
      note: String(row.url),
      values: { title: row.label, platform: row.platform, url: row.url, is_visible: row.is_visible },
    }),
    toRow: ({ title, ...input }) => ({ label: title, ...input }),
  },
  tutorials: {
    table: "posts",
    filter: "content_type=eq.tutorial",
    select: POST_SELECT,
    toItem: (row) => {
      const json = row.content_json as Values;
      return {
        heading: String(row.title),
        status: String(row.status),
        note: `/tutorials/${row.slug}`,
        values: { title: row.title, slug: row.slug, excerpt: row.excerpt, status: row.status, image_id: row.image_id, ...json },
      };
    },
    toRow: ({ title, slug, excerpt, status, body, category, level, minutes, artwork, video_url }, userId, current) => ({
      title,
      slug,
      excerpt,
      status,
      content_type: "tutorial",
      content_json: { body, category, level, minutes, artwork, video_url },
      search_text: `${category} ${body}`.slice(0, 50000),
      published_at: publishedAt(status, current),
      ...(current ? {} : { author_id: userId }),
    }),
  },
  updates: {
    table: "posts",
    filter: UPDATE_FILTER,
    select: POST_SELECT,
    toItem: (row) => ({
      heading: String(row.title),
      status: String(row.status),
      note: String(row.content_type).replaceAll("_", " "),
      values: { title: row.title, slug: row.slug, type: row.content_type, status: row.status, image_id: row.image_id, body: (row.content_json as Values).body },
    }),
    toRow: ({ title, slug, type, status, body }, userId, current) => ({
      title,
      slug,
      status,
      content_type: type,
      content_json: { body },
      search_text: String(body),
      published_at: publishedAt(status, current),
      ...(current ? {} : { author_id: userId }),
    }),
  },
  achievements: {
    table: "achievements",
    select: "id,title,description,organization,credential_url,achieved_on,icon,image_id,is_published,updated_at",
    toItem: ({ id: _id, updated_at: _updated, ...values }) => ({
      heading: String(values.title),
      status: shown(values.is_published),
      note: String(values.organization ?? values.achieved_on ?? ""),
      values,
    }),
    toRow: (input) => input,
  },
  products: {
    table: "products",
    select: "id,title,slug,description,category,product_type,price_amount_minor,license,artwork,image_id,status,published_at,updated_at",
    toItem: (row) => ({
      heading: String(row.title),
      status: String(row.status),
      note: row.price_amount_minor ? `GHS ${Number(row.price_amount_minor) / 100}` : "Free",
      values: { ...row, price: Number(row.price_amount_minor ?? 0) / 100 },
    }),
    toRow: ({ price, ...input }, userId, current) => {
      const minor = Math.round(Number(price) * 100);
      return {
        ...input,
        price_amount_minor: minor,
        pricing_model: minor ? "one_time" : "free",
        currency: "GHS",
        published_at: publishedAt(input.status, current),
        ...(current ? {} : { created_by: userId }),
      };
    },
  },
  opportunities: {
    table: "opportunities",
    select: "id,title,description,area,commitment,arrangement,image_id,is_open,updated_at",
    toItem: ({ id: _id, updated_at: _updated, ...values }) => ({
      heading: String(values.title),
      status: shown(values.is_open),
      note: String(values.area ?? ""),
      values,
    }),
    toRow: (input) => input,
  },
};

const toItem = (mapping: Mapping, row: Row): ContentItem => ({ id: row.id, updatedAt: row.updated_at, ...mapping.toItem(row) });
const scope = (mapping: Mapping) => (mapping.filter ? `&${mapping.filter}` : "");

async function failure(response: Response | null): Promise<SaveError> {
  if (!response) return new SaveError("Your session has ended. Please sign in again.");
  const body = await response.json().catch(() => ({}));
  if (body.code === "23505") return new SaveError("Something else already uses that web address.");
  if (response.status === 401 || response.status === 403 || body.code === "42501") return new SaveError("You don't have permission to do that.");
  console.error(`Content save failed: ${response.status} ${body.code ?? ""}`);
  return new SaveError("That couldn't be saved. Please try again.");
}

async function getRow(mapping: Mapping, id: string): Promise<Row | null> {
  const response = await userDataApi(`${mapping.table}?select=${mapping.select}&id=eq.${id}${scope(mapping)}&limit=1`);
  if (!response?.ok) throw new Error("Could not load the item");
  return ((await response.json()) as Row[])[0] ?? null;
}

export async function listContent(key: CollectionKey): Promise<ContentItem[]> {
  const mapping = MAPPINGS[key];
  const response = await userDataApi(`${mapping.table}?select=${mapping.select}${scope(mapping)}&order=updated_at.desc&limit=200`);
  if (!response?.ok) throw new Error("Could not load the list");
  return ((await response.json()) as Row[]).map((row) => toItem(mapping, row));
}

export async function getContent(key: CollectionKey, id: string) {
  const mapping = MAPPINGS[key];
  const row = await getRow(mapping, id);
  return row ? toItem(mapping, row) : null;
}

export async function saveContent(key: CollectionKey, id: string | null, input: Values, userId: string, formData: FormData) {
  const mapping = MAPPINGS[key];
  const current = id ? await getRow(mapping, id) : null;
  if (id && !current) throw new SaveError("That item no longer exists.");

  const save = async (image: { image_id?: string | null }) => {
    const response = await userDataApi(id ? `${mapping.table}?id=eq.${id}${scope(mapping)}&select=id` : `${mapping.table}?select=id`, {
      method: id ? "PATCH" : "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...mapping.toRow(input, userId, current), ...image }),
    });
    if (!response?.ok) throw await failure(response);

    const rows: { id: string }[] = await response.json();
    if (!rows[0]) throw new SaveError("You don't have permission to do that.");
    return rows[0].id;
  };
  return mapping.select.includes("image_id") ? withImage(formData, userId, current?.image_id, save) : save({});
}

export async function deleteContent(key: CollectionKey, id: string) {
  const mapping = MAPPINGS[key];
  const hasImage = mapping.select.includes("image_id");
  const titleColumn = mapping.titleColumn ?? "title";
  const response = await userDataApi(`${mapping.table}?id=eq.${id}${scope(mapping)}&select=${titleColumn}${hasImage ? ",image_id" : ""}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  if (!response?.ok) throw await failure(response);
  const rows: (Record<string, string> & { image_id?: string | null })[] = await response.json();
  if (!rows[0]) throw new SaveError("You don't have permission to do that.");
  await discardImage(rows[0].image_id);
  return rows[0][titleColumn];
}

export async function getAboutForEditing(): Promise<AboutContent | null> {
  const response = await userDataApi("site_settings?select=setting_value&setting_key=eq.about&limit=1");
  if (!response?.ok) throw new Error("Could not load the page text");
  const rows: { setting_value: AboutContent }[] = await response.json();
  return rows[0]?.setting_value ?? null;
}

export async function saveAbout(content: AboutContent, userId: string, formData: FormData) {
  const current = await getAboutForEditing();
  await withImage(formData, userId, current?.photo_id, async (image) => {
    const photo_id = "image_id" in image ? image.image_id : (current?.photo_id ?? null);
    const response = await userDataApi("site_settings?on_conflict=setting_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ setting_key: "about", setting_value: { ...content, photo_id }, is_public: true, updated_by: userId }),
    });
    if (!response?.ok) throw await failure(response);
  });
}
