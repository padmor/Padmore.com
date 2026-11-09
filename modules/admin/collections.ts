import { z } from "zod";
import { PRODUCT_CATEGORIES, TUTORIAL_CATEGORIES } from "@/lib/data";
import { PLATFORMS } from "@/features/contact/platforms";

// What the manager portal can publish. Imported by the browser form as well as
// the server, and the server validates again with the same schemas.

export type Field = {
  name: string;
  label: string;
  kind: "text" | "slug" | "textarea" | "select" | "url" | "date" | "number" | "checkbox" | "image";
  required?: boolean;
  optional?: boolean;
  max?: number;
  rows?: number;
  note?: string;
  placeholder?: string;
  options?: readonly (readonly [string, string])[];
  other?: boolean;
};

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? null : value), schema.nullable());

const checkbox = z.preprocess((value) => value === "on", z.boolean());
const title = z.string().trim().min(1, "Add a title.").max(150);
const slug = z.string().trim().toLowerCase().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens in the web address.");
const contactUrl = z.url({ protocol: /^(https?|mailto|tel)$/, error: "Enter a full link starting with https://, mailto: or tel:" }).max(2048);
const webUrl = z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).max(2048);
const choice = (message: string) => z.string().trim().min(1, message).max(80, "Keep that under 80 characters.");
const body = z.string().trim().min(1, "Add the content.").max(100000);

const pair = (values: readonly string[]) => values.map((value) => [value, value] as const);
const values = (options: readonly (readonly [string, string])[]) => options.map(([value]) => value) as [string, ...string[]];

const PUBLISH_OPTIONS = [["draft", "Draft (only staff can see it)"], ["published", "Published (on the website)"], ["archived", "Archived (hidden)"]] as const;
const BODY_NOTE = "Leave a blank line between paragraphs. Start a line with ## for a heading or - for a bullet.";

const LEVELS = pair(["Beginner", "Intermediate", "Advanced"]);
const UPDATE_TYPES = [["project_update", "Project update"], ["development_log", "Build log"], ["announcement", "Announcement"], ["personal_thought", "Learning note"]] as const;
const PRODUCT_TYPES = [["source_code", "Digital download"], ["service", "Service"]] as const;
const LICENSES = pair(["Personal use", "Personal and commercial use", "Single developer license", "Team license", "Individual learning license"]);
const ACHIEVEMENT_CATEGORIES = [["certificate", "Certificate"], ["award", "Award"], ["milestone", "Work and milestones"]] as const;
const ACHIEVEMENT_ICONS = [["🏆", "🏆 Award"], ["🎓", "🎓 Education"], ["📜", "📜 Certificate"], ["🥇", "🥇 First place"], ["🚀", "🚀 Launch"], ["💡", "💡 Idea"], ["⭐", "⭐ Milestone"]] as const;
const OPPORTUNITY_AREAS = pair(["Web Apps", "Mobile Apps", "Product Design", "Backend Systems", "Content", "Marketing"]);
const COMMITMENTS = pair(["Full-time", "Part-time", "Flexible", "Project-based"]);
const ARRANGEMENTS = pair(["Remote", "On-site", "Hybrid", "Discuss together"]);

export const COLLECTIONS = {
  tutorials: {
    label: "Tutorials",
    singular: "tutorial",
    intro: "Guides on the Tutorials page and the home page. Open a tutorial to attach slides, PDFs, Markdown, images, audio or video.",
    audit: "tutorial",
    icon: "book",
    publicPath: "/tutorials",
    roles: ["owner", "admin", "editor"],
    schema: z.object({
      title,
      slug,
      excerpt: z.string().trim().min(1, "Add a short summary.").max(400),
      body,
      category: choice("Choose a topic."),
      level: choice("Choose a level."),
      minutes: z.coerce.number({ error: "Enter the reading time in minutes." }).int("Enter the reading time in whole minutes.").min(1, "Enter the reading time in minutes.").max(1000),
      video_url: optional(webUrl),
      status: z.enum(values(PUBLISH_OPTIONS)),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, max: 150 },
      { name: "slug", label: "Web address", kind: "slug", required: true, max: 120 },
      { name: "excerpt", label: "Short summary", kind: "textarea", rows: 2, required: true, max: 400 },
      { name: "body", label: "Tutorial content", kind: "textarea", rows: 16, required: true, max: 100000, note: BODY_NOTE },
      { name: "category", label: "Topic", kind: "select", other: true, options: pair(TUTORIAL_CATEGORIES) },
      { name: "level", label: "Level", kind: "select", other: true, options: LEVELS },
      { name: "minutes", label: "Reading time in minutes", kind: "number", required: true },
      { name: "video_url", label: "Video link", kind: "url", optional: true, placeholder: "https://" },
      { name: "image_id", label: "Cover image", kind: "image" },
      { name: "status", label: "Who can see it", kind: "select", options: PUBLISH_OPTIONS },
    ] as Field[],
  },
  updates: {
    label: "Updates",
    singular: "update",
    intro: "Notes and news on the Updates page.",
    audit: "update",
    icon: "bell",
    publicPath: "/updates",
    roles: ["owner", "admin", "editor"],
    schema: z.object({
      title,
      slug,
      type: z.enum(values(UPDATE_TYPES)),
      body: z.string().trim().min(1, "Add the content.").max(5000),
      status: z.enum(values(PUBLISH_OPTIONS)),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, max: 150 },
      { name: "slug", label: "Reference name", kind: "slug", required: true, max: 120 },
      { name: "type", label: "Type", kind: "select", options: UPDATE_TYPES },
      { name: "status", label: "Who can see it", kind: "select", options: PUBLISH_OPTIONS },
      { name: "body", label: "Update", kind: "textarea", rows: 6, required: true, max: 5000 },
      { name: "image_id", label: "Cover image", kind: "image" },
    ] as Field[],
  },
  achievements: {
    label: "Achievements",
    singular: "achievement",
    intro: "Certificates, awards and work milestones on the Achievements page. Open an item to attach PDFs, documents, images and videos.",
    audit: "achievement",
    icon: "sparkles",
    publicPath: "/achievements",
    roles: ["owner", "admin", "editor"],
    schema: z.object({
      title,
      description: optional(z.string().trim().max(1000)),
      category: z.enum(values(ACHIEVEMENT_CATEGORIES)),
      organization: optional(z.string().trim().max(150)),
      credential_url: optional(webUrl),
      achieved_on: optional(z.iso.date("Use a valid date.")),
      icon: optional(z.string().trim().max(8, "Use a single emoji or symbol for the icon.")),
      is_published: checkbox,
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, max: 150 },
      { name: "category", label: "Type", kind: "select", options: ACHIEVEMENT_CATEGORIES },
      { name: "organization", label: "Awarded by", kind: "text", optional: true, max: 150 },
      { name: "achieved_on", label: "Date", kind: "date", optional: true },
      { name: "icon", label: "Icon", kind: "select", optional: true, other: true, options: ACHIEVEMENT_ICONS },
      { name: "credential_url", label: "Certificate link", kind: "url", optional: true, placeholder: "https://" },
      { name: "description", label: "Description", kind: "textarea", rows: 3, optional: true, max: 1000 },
      { name: "image_id", label: "Cover image", kind: "image" },
      { name: "is_published", label: "Show on the website", kind: "checkbox" },
    ] as Field[],
  },
  products: {
    label: "Store",
    singular: "product",
    intro: "Products on the Store page. Prices are in Ghana cedis.",
    audit: "product",
    icon: "store",
    publicPath: "/store",
    roles: ["owner", "admin"],
    schema: z.object({
      title,
      slug,
      description: z.string().trim().min(1, "Add a description.").max(2000),
      category: choice("Choose a category."),
      product_type: z.enum(values(PRODUCT_TYPES)),
      price: z.coerce.number({ error: "Enter a price, or 0 if it's free." }).min(0, "The price can't be negative.").max(10_000_000).multipleOf(0.01, "Use at most two decimal places."),
      license: optional(z.string().trim().max(200)),
      status: z.enum(values(PUBLISH_OPTIONS)),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, max: 150 },
      { name: "slug", label: "Web address", kind: "slug", required: true, max: 120 },
      { name: "description", label: "Description", kind: "textarea", rows: 4, required: true, max: 2000 },
      { name: "category", label: "Category", kind: "select", other: true, options: pair(PRODUCT_CATEGORIES) },
      { name: "product_type", label: "Type", kind: "select", options: PRODUCT_TYPES },
      { name: "price", label: "Price in GHS", kind: "number", required: true, note: "Enter 0 for a free product." },
      { name: "license", label: "License", kind: "select", optional: true, other: true, options: LICENSES },
      { name: "image_id", label: "Cover image", kind: "image" },
      { name: "status", label: "Who can see it", kind: "select", options: PUBLISH_OPTIONS },
    ] as Field[],
  },
  opportunities: {
    label: "Opportunities",
    singular: "opportunity",
    intro: "Open roles on the Build With Me page.",
    audit: "opportunity",
    icon: "users",
    publicPath: "/build-with-me",
    roles: ["owner", "admin", "editor"],
    schema: z.object({
      title,
      description: z.string().trim().min(1, "Add a description.").max(1000),
      area: optional(z.string().trim().max(80)),
      commitment: optional(z.string().trim().max(80)),
      arrangement: optional(z.string().trim().max(80)),
      is_open: checkbox,
    }),
    fields: [
      { name: "title", label: "Role", kind: "text", required: true, max: 150 },
      { name: "area", label: "Area", kind: "select", optional: true, other: true, options: OPPORTUNITY_AREAS },
      { name: "commitment", label: "Commitment", kind: "select", optional: true, other: true, options: COMMITMENTS },
      { name: "arrangement", label: "Arrangement", kind: "select", optional: true, other: true, options: ARRANGEMENTS },
      { name: "description", label: "Description", kind: "textarea", rows: 4, required: true, max: 1000 },
      { name: "image_id", label: "Cover image", kind: "image" },
      { name: "is_open", label: "Open and shown on the website", kind: "checkbox" },
    ] as Field[],
  },
  links: {
    label: "Contact links",
    singular: "link",
    intro: "Your email, phone and social handles. They appear in the home page Contact me pop-up, on the Contact page and in the footer.",
    audit: "link",
    icon: "globe",
    publicPath: "/",
    roles: ["owner", "admin", "editor"],
    schema: z.object({
      title: z.string().trim().min(1, "Add a label.").max(80),
      platform: z.enum(values(PLATFORMS)),
      url: contactUrl,
      is_visible: checkbox,
    }),
    fields: [
      { name: "title", label: "Label", kind: "text", required: true, max: 80, placeholder: "My GitHub" },
      { name: "platform", label: "Type", kind: "select", options: PLATFORMS },
      { name: "url", label: "Link", kind: "text", required: true, max: 2048, placeholder: "https://github.com/you, mailto:you@gmail.com or tel:+233…" },
      { name: "is_visible", label: "Show on the website", kind: "checkbox" },
    ] as Field[],
  },
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
export const isCollection = (key: string): key is CollectionKey => Object.hasOwn(COLLECTIONS, key);

export const aboutSchema = z.object({
  headline: z.string().trim().min(1, "Add a headline.").max(150),
  intro: z.string().trim().min(1, "Add an introduction.").max(400),
  bio: z.string().trim().min(1, "Add your biography.").max(5000),
  location: optional(z.string().trim().max(100)),
  // Shown first in the home page Contact me pop-up and on the Contact page.
  email: optional(z.email("Enter a valid email address.").max(254)).optional(),
  phone: optional(z.string().trim().regex(/^\+?[0-9 ()-]{6,20}$/, "Enter a phone number such as +233 20 000 0000.")).optional(),
  skills: z
    .string()
    .max(1000)
    .transform((value) => [...new Set(value.split(",").map((name) => name.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(50, "Keep each skill under 50 characters.")).max(40, "Use at most 40 skills.")),
  interests: z
    .string()
    .max(1000)
    .transform((value) => [...new Set(value.split(",").map((name) => name.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(50, "Keep each interest under 50 characters.")).max(40, "Use at most 40.")).optional(),
  // One school or course per line.
  education: z
    .string()
    .max(2000)
    .transform((value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(200, "Keep each school line under 200 characters.")).max(10, "Use at most 10 lines."))
    .optional(),
  // Shown on the About me page and the home page About me tab.
  mission: optional(z.string().trim().max(600, "Keep your mission under 600 characters.")).optional(),
  vision: optional(z.string().trim().max(600, "Keep your vision under 600 characters.")).optional(),
  // One role per line: Role · Organisation · Years · What you did
  experience: z
    .string()
    .max(4000)
    .transform((value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(400, "Keep each experience line under 400 characters.")).max(12, "Use at most 12 lines."))
    .optional(),
});
export type AboutContent = z.infer<typeof aboutSchema> & { photo_id?: string | null; hero_photo_id?: string | null };
