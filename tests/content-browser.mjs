// Drives the tutorials, updates, achievements, store, opportunities and About
// sections of the manager portal in Microsoft Edge against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:content              (in another)
//
// Uses a throwaway account and uniquely named items, and removes them all.
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
if (!/^http:\/\/localhost(:\d+)?$/.test(BASE)) throw new Error("Browser tests only run against localhost");

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
);
const owner = neon(env.DATABASE_URL);

const run = randomBytes(4).toString("hex");
const email = `padmore-e2e-content-${run}@example.com`;
const password = randomBytes(18).toString("base64url");
const name = (kind) => `E2E ${kind} ${run}`;
const slugOf = (kind) => `e2e-${kind.toLowerCase()}-${run}`;
const WAIT = 45_000;
const SAVE = 'button[type="submit"]:not(.admin-danger)';

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", label, detail);
}
const html = async (path) => (await fetch(`${BASE}${path}`)).text();

await owner`delete from neon_auth."user" where email like 'padmore-e2e-%'`;
await owner`delete from app_private.rate_limits`;
const [savedAbout] = await owner`select setting_value, is_public from public.site_settings where setting_key = 'about'`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
page.setDefaultTimeout(WAIT);
page.on("dialog", (dialog) => dialog.accept());
const problems = [];
page.on("pageerror", (error) => problems.push(String(error.message).slice(0, 160)));

const refused = () => page.getByRole("heading", { name: "That page isn't here" }).first().waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
const alertText = async () => {
  const alert = page.locator('.inline-notice[role="alert"]').first();
  await alert.waitFor({ timeout: WAIT }).catch(() => {});
  return (await alert.textContent().catch(() => "")) ?? "";
};
const saved = (collection) => page.waitForURL(`**/admin/${collection}`, { timeout: WAIT }).catch(async () => console.log(`     not saved in ${collection}:`, await alertText()));
const form = (values) => Object.entries(values).reduce(async (previous, [field, value]) => {
  await previous;
  const input = page.locator(`#content-${field}`);
  if ((await input.evaluate((el) => el.tagName)) === "SELECT") await input.selectOption(value);
  else await input.fill(value);
}, Promise.resolve());

async function openEdit(collection, heading) {
  await page.goto(`${BASE}/admin/${collection}`);
  await page.locator("tr", { hasText: heading }).getByRole("link", { name: "Edit" }).click();
  await page.locator(SAVE).waitFor({ timeout: WAIT });
  await page.waitForURL(new RegExp(`/admin/${collection}/[0-9a-f-]{36}$`), { timeout: WAIT });
}

async function remove(collection, heading) {
  await openEdit(collection, heading);
  await page.click('button:has-text("Delete")');
  await saved(collection);
}

try {
  await page.goto(`${BASE}/signup`);
  await page.fill("#auth-name", "Content Tester");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", password);
  await page.click(SAVE);
  await page.getByText("Welcome back, Content Tester").first().waitFor({ timeout: WAIT }).catch(() => {});
  const [{ id: userId }] = await owner`select id from neon_auth."user" where email = ${email}`;

  await page.goto(`${BASE}/admin/tutorials`);
  check("ordinary member is refused tutorials", (await refused()) && (await page.locator("#content-title").count()) === 0);

  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'editor')`;
  await page.goto(`${BASE}/admin/products`);
  check("editor is refused the store", await refused());
  await page.goto(`${BASE}/admin/about`);
  check("editor is refused the About text", await refused());
  await page.goto(`${BASE}/admin/users`);
  check("unknown section does not exist", await refused());
  await page.goto(`${BASE}/admin/tutorials`);
  await page.getByRole("heading", { name: "Tutorials" }).first().waitFor({ timeout: WAIT });
  check("editor can open tutorials", (await page.getByRole("link", { name: "About me" }).count()) === 0);
  await owner`delete from public.user_roles where user_id = ${userId}`;
  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'admin')`;

  // Images, used by the sections below
  const png = Buffer.concat([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==", "base64"), Buffer.from(run)]);
  const upload = (name, mimeType, buffer) => page.setInputFiles("#content-image", { name, mimeType, buffer });

  // Tutorials
  const tutorial = name("Tutorial");
  const tutorialSlug = slugOf("tutorial");
  await page.goto(`${BASE}/admin/tutorials/new`);
  await page.fill("#content-title", tutorial);
  check("tutorial web address is suggested", (await page.inputValue("#content-slug")) === tutorialSlug);
  await form({ excerpt: "A short summary.", body: "## First step\n\nHello <script>alert(1)</script> world.\n\n- One bullet", minutes: "7", video_url: "javascript:alert(1)" });
  await page.evaluate(() => document.querySelector("form.admin-form").setAttribute("novalidate", ""));
  await page.click(SAVE);
  check("dangerous video link is refused", (await alertText()).includes("https://"));
  if (!(await page.inputValue("#content-title"))) {
    await page.fill("#content-title", tutorial);
    await page.fill("#content-slug", tutorialSlug);
    await form({ excerpt: "A short summary.", body: "## First step\n\nHello <script>alert(1)</script> world.\n\n- One bullet", minutes: "7" });
  }
  await page.fill("#content-video_url", "https://example.com/video");
  await page.click(SAVE);
  await saved("tutorials");
  check("draft tutorial is created", (await page.getByText(tutorial).count()) > 0, page.url());
  check("draft tutorial is hidden", !(await html(`/tutorials/${tutorialSlug}`)).includes("A short summary."));
  check("draft tutorial is not listed", !(await html("/tutorials")).includes(tutorial));

  await openEdit("tutorials", tutorial);
  check("edit form keeps the content", (await page.inputValue("#content-body")).includes("First step") && (await page.inputValue("#content-minutes")) === "7");
  await page.selectOption("#content-status", "published");
  await page.click(SAVE);
  await saved("tutorials");

  const article = await html(`/tutorials/${tutorialSlug}`);
  check("published tutorial is live", article.includes("A short summary.") && /7(<!-- -->)? min read/.test(article));
  check("tutorial headings and bullets render", /<h2[^>]*>First step<\/h2>/.test(article) && /<li>One bullet<\/li>/.test(article));
  check("typed script is shown as text, never run", !article.includes("<script>alert(1)") && article.includes("&lt;script&gt;alert(1)"));
  check("video link appears", article.includes("https://example.com/video"));
  check("tutorial is on the Tutorials page", (await html("/tutorials")).includes(tutorial));
  check("tutorial is on the home page", (await html("/")).includes(tutorial));

  await page.goto(`${BASE}/admin/tutorials/new`);
  await page.fill("#content-title", `${tutorial} copy`);
  await page.fill("#content-slug", tutorialSlug);
  await form({ excerpt: "Copy", body: "Copy", minutes: "1" });
  await page.click(SAVE);
  check("duplicate web address is refused", (await alertText()).includes("already uses"));

  // Updates
  const update = name("Update");
  await page.goto(`${BASE}/admin/updates/new`);
  await page.fill("#content-title", update);
  await form({ type: "development_log", status: "published", body: "Update body text." });
  await page.click(SAVE);
  await saved("updates");
  const updates = await html("/updates");
  check("update is live with its type", updates.includes(update) && updates.includes("Build log"));
  const [{ n: tutorialLeak }] = await owner`select count(*)::int n from public.posts where slug = ${slugOf("update")} and content_type = 'tutorial'`;
  check("update is not stored as a tutorial", tutorialLeak === 0 && !(await html("/tutorials")).includes(update));

  // Achievements
  const achievement = name("Achievement");
  await page.goto(`${BASE}/admin/achievements/new`);
  await form({ title: achievement, achieved_on: "2026-02-03", icon: "🏆", description: "Earned it." });
  await page.click(SAVE);
  await saved("achievements");
  check("unpublished achievement is hidden", !(await html("/achievements")).includes(achievement));
  await openEdit("achievements", achievement);
  await page.check('input[name="is_published"]');
  await page.click(SAVE);
  await saved("achievements");
  const achievementsPage = await html("/achievements");
  check("published achievement is live", achievementsPage.includes(achievement) && achievementsPage.includes("2026"));

  // Store
  const product = name("Product");
  const productSlug = slugOf("product");
  await page.goto(`${BASE}/admin/products/new`);
  await page.fill("#content-title", product);
  await form({ description: "Product text.", price: "25.555", status: "published", license: "Single developer license" });
  await page.click(SAVE);
  check("a price with too many decimals is refused", (await alertText()).includes("two decimal"));
  if (!(await page.inputValue("#content-title"))) {
    await page.fill("#content-title", product);
    await page.fill("#content-slug", productSlug);
    await form({ description: "Product text.", status: "published", license: "Single developer license" });
  }
  await page.fill("#content-price", "25.50");
  await page.click(SAVE);
  await saved("products");
  const [productRow] = await owner`select price_amount_minor::int minor, pricing_model, currency from public.products where slug = ${productSlug}`;
  check("price is stored exactly, in pesewas", productRow?.minor === 2550 && productRow?.pricing_model === "one_time" && productRow?.currency === "GHS", JSON.stringify(productRow));
  const storePage = await html("/store");
  check("product is in the store", storePage.includes(product) && /25\.50/.test(storePage));
  const productPage = await html(`/store/${productSlug}`);
  check("product page is live", productPage.includes("Product text.") && productPage.includes("Single developer"));

  // Opportunities
  const opportunity = name("Opportunity");
  await page.goto(`${BASE}/admin/opportunities/new`);
  await form({ title: opportunity, area: "__other__", description: "Opportunity text." });
  await page.fill("#content-area-other", `Robotics ${run}`);
  await upload("opportunity.png", "image/png", png);
  await page.check('input[name="is_open"]');
  await page.click(SAVE);
  await saved("opportunities");
  const buildPage = await html("/build-with-me");
  check("opportunity is live", buildPage.includes(opportunity) && buildPage.includes(`Robotics ${run}`));
  check("opportunity shows its cover image", buildPage.includes("/media/"));

  // About
  const skill = `Skill${run}`;
  await page.goto(`${BASE}/admin/about`);
  await page.fill("#about-bio", `Biography ${run}.\n\nSecond paragraph.`);
  await page.fill("#about-skills", `${skill}, ${skill}`);
  await page.click(SAVE);
  await page.waitForURL("**/admin/about?saved=1", { timeout: WAIT }).catch(() => {});
  const aboutPage = await html("/about");
  check("biography is on the About page", aboutPage.includes(`Biography ${run}.`) && aboutPage.includes("Second paragraph."));
  check("skills are saved without duplicates", aboutPage.split(`>${skill}<`).length === 2);
  check("profile page shows the skills", (await html("/profile")).includes(skill));
  check("sample people are gone from Community", !/Alex Carter|Sample community/.test(await html("/community")));
  check("hosted apps has no sample note", !/sample entries/.test(await html("/hosted-apps")));
  check("placeholder notes are gone", !/Illustrative|Replace the temporary|sample biography/i.test(aboutPage));

  // Images
  const tutorialImage = async () => (await owner`select image_id from public.posts where slug = ${tutorialSlug}`)[0]?.image_id;
  const imageCount = async () => (await owner`select count(*)::int n from public.site_images where uploaded_by = ${userId}`)[0].n;

  const before = await imageCount();
  await openEdit("tutorials", tutorial);
  await upload("evil.png", "image/png", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'));
  await page.click(SAVE);
  check("a script renamed as an image is refused", (await alertText()).includes("JPEG, PNG or WebP"));
  check("refused file is not stored", (await imageCount()) === before);

  await openEdit("tutorials", tutorial);
  await upload("big.png", "image/png", Buffer.alloc(2 * 1024 * 1024 + 1));
  check("an image over 2 MB is stopped in the form", await page.locator('.admin-image-error[role="alert"]').waitFor({ timeout: WAIT }).then(() => true).catch(() => false));

  await openEdit("tutorials", tutorial);
  await upload("cover.png", "image/png", png);
  await page.click(SAVE);
  await saved("tutorials");
  const firstImage = await tutorialImage();
  check("image is attached to the tutorial", Boolean(firstImage));
  const served = await fetch(`${BASE}/media/${firstImage}`);
  const servedBytes = Buffer.from(await served.arrayBuffer());
  check("image is served exactly as uploaded", served.status === 200 && served.headers.get("content-type") === "image/png" && servedBytes.equals(png));
  check("image cannot be reinterpreted by the browser", served.headers.get("x-content-type-options") === "nosniff");
  check("image is cached", (served.headers.get("cache-control") ?? "").includes("immutable"));
  check("tutorial page shows the image", (await html(`/tutorials/${tutorialSlug}`)).includes(`/media/${firstImage}`));
  check("home page shows the image", (await html("/")).includes(`/media/${firstImage}`));
  check("bad image address is not found", (await fetch(`${BASE}/media/1'%20or%201=1`)).status === 404 && (await fetch(`${BASE}/media/00000000-0000-4000-8000-000000000000`)).status === 404);

  await openEdit("tutorials", tutorial);
  await page.waitForSelector("#content-body");
  await page.fill("#content-minutes", "8");
  await page.click(SAVE);
  await saved("tutorials");
  check("saving without choosing a file keeps the image", (await tutorialImage()) === firstImage);

  await openEdit("tutorials", tutorial);
  await upload("large.png", "image/png", Buffer.concat([png, Buffer.alloc(1_900_000)]));
  await page.click(SAVE);
  await saved("tutorials");
  const secondImage = await tutorialImage();
  check("a large image near the limit uploads", Boolean(secondImage) && secondImage !== firstImage);
  check("replaced image is removed", (await fetch(`${BASE}/media/${firstImage}`)).status === 404 && (await imageCount()) === before + 1);

  await openEdit("tutorials", tutorial);
  await page.check('input[name="remove_image"]');
  await page.click(SAVE);
  await saved("tutorials");
  check("removing an image works", (await tutorialImage()) === null && (await imageCount()) === before);

  await page.goto(`${BASE}/admin/about`);
  await page.fill("#about-bio", `Biography ${run}.`);
  await upload("me.png", "image/png", png);
  await page.click(SAVE);
  await page.waitForURL("**/admin/about?saved=1", { timeout: WAIT }).catch(() => {});
  const [{ photo }] = await owner`select setting_value->>'photo_id' as photo from public.site_settings where setting_key = 'about'`;
  check("your photo reaches the About and Profile pages", Boolean(photo) && (await html("/about")).includes(`/media/${photo}`) && (await html("/profile")).includes(`/media/${photo}`));
  const homeHtml = await html("/");
  check("home hero shows the two videos", homeHtml.includes("/videos/hero/developer-coding.mp4") && homeHtml.includes("/videos/hero/team-success.mp4"));
  check("the placeholder portrait is replaced", !(await html("/about")).includes("portrait-reference-placeholder"));

  await openEdit("products", product);
  await upload("product.png", "image/png", png);
  await page.click(SAVE);
  await saved("products");
  const [{ image_id: productImage }] = await owner`select image_id from public.products where slug = ${productSlug}`;
  check("store shows the product image", Boolean(productImage) && (await html("/store")).includes(`/media/${productImage}`));

  await page.goto(`${BASE}/admin/products`);
  await page.locator(".admin-thumb").first().waitFor({ timeout: WAIT }).catch(() => {});
  check("list shows a thumbnail of the attached image", (await page.locator(`.admin-thumb[src="/media/${productImage}"]`).count()) === 1);

  await openEdit("products", product);
  check("edit form shows what is attached", (await page.locator(`.admin-image-current a[href="/media/${productImage}"]`).count()) >= 1);
  await upload("next.png", "image/png", png);
  check("chosen image is previewed before saving", await page.getByText("Ready to attach").waitFor({ timeout: WAIT }).then(() => true).catch(() => false));

  await page.goto(`${BASE}/admin/images`);
  const galleryItem = page.locator(".admin-gallery-item", { has: page.locator(`img[src="/media/${productImage}"]`) });
  await galleryItem.waitFor({ timeout: WAIT }).catch(() => {});
  check("gallery shows the image and what it is attached to", (await galleryItem.getByRole("link", { name: product }).count()) === 1);
  check("gallery shows your profile image", (await page.getByRole("link", { name: "Profile image" }).count()) === 1);

  // Contact links
  const linkLabel = name("Link");
  await page.goto(`${BASE}/admin/links/new`);
  await form({ title: linkLabel, platform: "github", url: "javascript:alert(1)" });
  await page.click(SAVE);
  check("dangerous contact link is refused", (await alertText()).includes("https://"));
  if (!(await page.inputValue("#content-title"))) await form({ title: linkLabel, platform: "github" });
  await page.fill("#content-url", `https://example.com/${run}`);
  await page.check('input[name="is_visible"]');
  await page.click(SAVE);
  await saved("links");
  check("contact link is on the Contact page", (await html("/contact")).includes(`https://example.com/${run}`));
  check("contact link is in the home page Contact me pop-up", ((await html("/")).split("contact-modal-list")[1] ?? "").split("</ul>")[0].includes(`https://example.com/${run}`));
  check("contact page has no placeholders", !/Add your|placeholders/.test(await html("/contact")));

  // Public forms reach the portal
  const visitor = `padmore-e2e-visitor-${run}@example.com`;
  await page.context().clearCookies();
  await page.goto(`${BASE}/contact`);
  await page.fill("#contact-name", "Visitor");
  await page.fill("#contact-email", visitor);
  await page.fill("#contact-message", `Contact message ${run}`);
  await page.click('form.form-card button[type="submit"]');
  await page.getByText("your message has been received").waitFor({ timeout: WAIT }).catch(() => {});
  const contactRows = await owner`select kind, user_id, status from public.inquiries where email = ${visitor}`;
  check("contact form saves to the database", contactRows.length === 1 && contactRows[0].kind === "general" && contactRows[0].status === "new");

  await page.goto(`${BASE}/request-project`);
  await page.fill("#request-name", "Visitor");
  await page.fill("#request-email", visitor);
  await page.fill("#request-title", `Request ${run}`);
  await page.fill("#request-description", "A project description that is long enough.");
  await page.selectOption("#request-type", "Website");
  await page.selectOption("#request-budget", "Under GHS 5,000");
  await page.check('form.form-card input[type="checkbox"]:not([name])');
  await page.click('form.form-card button[type="submit"]');
  await page.getByText("your project request has been received").waitFor({ timeout: WAIT }).catch(() => {});
  const [requestRow] = await owner`select d.project_type, d.project_scope from public.inquiries i join public.project_request_details d on d.inquiry_id = i.id where i.email = ${visitor}`;
  check("project request saves with its details", requestRow?.project_type === "Website" && requestRow?.project_scope.includes("Under GHS 5,000"));

  await page.goto(`${BASE}/build-with-me`);
  check("application form lists real opportunities", (await page.locator("#collab-opportunity option", { hasText: opportunity }).count()) === 1);
  await page.fill("#collab-name", "Visitor");
  await page.fill("#collab-email", visitor);
  await page.selectOption("#collab-role", "Other");
  await page.fill("#collab-skills", "React, Figma");
  await page.fill("#collab-motivation", "I would like to contribute to this work.");
  await page.check('form.form-card input[type="checkbox"]');
  await page.click('form.form-card button[type="submit"]');
  await page.getByText("your application has been received").waitFor({ timeout: WAIT }).catch(() => {});
  const [collabRow] = await owner`select d.skills from public.inquiries i join public.collaboration_request_details d on d.inquiry_id = i.id where i.email = ${visitor}`;
  check("application saves with its details", collabRow?.skills?.join() === "React,Figma");

  const subscribe = async () => {
    await page.goto(`${BASE}/`);
    await page.fill("#newsletter-email", visitor);
    await page.click('.newsletter-form:not(.compact) button[type="submit"]');
    await page.locator(".newsletter-form:not(.compact)").getByText("Thanks for subscribing").waitFor({ timeout: WAIT }).catch(() => {});
  };
  await subscribe();
  await subscribe();
  const [{ n: subscriberRows }] = await owner`select count(*)::int n from public.newsletter_subscribers where email = ${visitor}`;
  check("newsletter saves one row per address", subscriberRows === 1);

  await page.goto(`${BASE}/admin/enquiries`);
  check("signed-out visitor cannot read enquiries", page.url().includes("/signin"));

  await page.goto(`${BASE}/signin`);
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", password);
  await page.click(SAVE);
  await page.getByText("Welcome back, Content Tester").first().waitFor({ timeout: WAIT }).catch(() => {});

  await page.goto(`${BASE}/admin/enquiries`);
  const card = page.locator(".admin-enquiry", { hasText: `Contact message ${run}` });
  await card.waitFor({ timeout: WAIT }).catch(() => {});
  check("enquiry appears in the portal", (await card.count()) === 1);
  check("project details appear in the portal", (await page.getByText("Under GHS 5,000").count()) >= 1);
  await card.locator("select").selectOption("reviewing");
  await card.getByRole("button", { name: "Update" }).click();
  await page.waitForFunction(() => true);
  let status = "";
  for (let attempt = 0; attempt < 20 && status !== "reviewing"; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    status = (await owner`select status from public.inquiries where email = ${visitor} and kind = 'general'`)[0].status;
  }
  check("enquiry status can be changed", status === "reviewing", status);
  await page.goto(`${BASE}/admin/subscribers`);
  check("subscriber appears in the portal", await page.getByText(visitor).first().waitFor({ timeout: WAIT }).then(() => true).catch(() => false));

  // Dashboard and audit
  await page.goto(`${BASE}/admin`);
  const tutorialCard = page.locator(".admin-stat-card", { hasText: "Published tutorials" }).locator("strong");
  await tutorialCard.waitFor({ timeout: WAIT });
  check("dashboard counts published tutorials", Number(await tutorialCard.textContent()) >= 1);
  check("dashboard shows the store count", (await page.getByText("Published products").count()) > 0);
  const audit = await owner`select action from public.audit_logs where actor_user_id = ${userId}`;
  const actions = new Set(audit.map((row) => row.action));
  check("changes are in the audit log", ["tutorial.created", "tutorial.updated", "update.created", "achievement.updated", "product.created", "opportunity.created", "about.updated"].every((action) => actions.has(action)), [...actions].join());

  // Deleting
  await remove("tutorials", tutorial);
  check("deleted tutorial is gone", !(await html(`/tutorials/${tutorialSlug}`)).includes("A short summary.") && !(await html("/")).includes(tutorial));
  await remove("updates", update);
  check("deleted update is gone", !(await html("/updates")).includes(update));
  await remove("achievements", achievement);
  check("deleted achievement is gone", !(await html("/achievements")).includes(achievement));
  await remove("products", product);
  check("deleted product is gone", !(await html("/store")).includes(product));
  check("deleting a product deletes its image", (await fetch(`${BASE}/media/${productImage}`)).status === 404);
  await remove("opportunities", opportunity);
  await remove("links", linkLabel);
  check("deleted contact link is gone", !(await html("/contact")).includes(`https://example.com/${run}`));
  check("deleted opportunity is gone", !(await html("/build-with-me")).includes(opportunity));
  const [{ n: deletes }] = await owner`select count(*)::int n from public.audit_logs where actor_user_id = ${userId} and action like '%.deleted'`;
  check("deletes are in the audit log", deletes === 6, `${deletes}`);
  check("no browser errors", problems.length === 0, problems[0] ?? "");
} catch (error) {
  check("browser run completed", false, String(error.message).slice(0, 240));
  console.log("at", page.url(), "|", (await page.locator("main, body").first().innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 400), "|", problems.join(" ; "));
} finally {
  await browser.close();
  const titles = ["Tutorial", "Update", "Achievement", "Product", "Opportunity"].map(name);
  await owner`delete from public.posts where title = any(${titles})`;
  await owner`delete from public.achievements where title = any(${titles})`;
  await owner`delete from public.products where title = any(${titles})`;
  await owner`delete from public.opportunities where title = any(${titles})`;
  await owner`delete from public.social_links where label = ${name("Link")}`;
  await owner`delete from public.inquiries where email like ${`padmore-e2e-visitor-${run}%`}`;
  await owner`delete from public.newsletter_subscribers where email like ${`padmore-e2e-visitor-${run}%`}`;
  if (savedAbout) await owner`update public.site_settings set setting_value = ${JSON.stringify(savedAbout.setting_value)}::jsonb, is_public = ${savedAbout.is_public} where setting_key = 'about'`;
  else await owner`delete from public.site_settings where setting_key = 'about'`;
  await owner`delete from public.site_images where uploaded_by in (select id from neon_auth."user" where email = ${email})`;
  await owner`delete from public.audit_logs where actor_user_id in (select id from neon_auth."user" where email = ${email})`;
  const removed = await owner`delete from neon_auth."user" where email = ${email} returning id`;
  await owner`delete from app_private.rate_limits`;
  const [left] = await owner`select (select count(*)::int from public.user_roles) as roles, (select count(*)::int from neon_auth."user" where email like 'padmore-e2e-%') as users, (select count(*)::int from public.posts where slug like 'e2e-%') as posts`;
  console.log(`cleanup: ${removed.length} account deleted; test users ${left.users}; test posts ${left.posts}; role rows ${left.roles} (yours is 1)`);
}

console.log(`pass ${passed} fail ${failed}`);
process.exitCode = failed ? 1 : 0;
