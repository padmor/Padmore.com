// Drives the manager portal in Microsoft Edge against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:admin                (in another)
//
// Uses throwaway accounts and a uniquely named project, and removes them all.
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
const editorEmail = `padmore-e2e-editor-${run}@example.com`;
const password = randomBytes(18).toString("base64url");
const title = `E2E Project ${run}`;
const slug = `e2e-project-${run}`;
const tech = `E2ETech${run}`;
const WAIT = 90_000;

let passed = 0;
let failed = 0;
function check(name, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", name, detail);
}
const publicApi = (path) => fetch(`${BASE}/api/v1/projects/${path}`);

await owner`delete from neon_auth."user" where email like 'padmore-e2e-%'`;
await owner`delete from app_private.rate_limits`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
page.setDefaultTimeout(WAIT);
page.on("dialog", (dialog) => dialog.accept());
const problems = [];
page.on("pageerror", (error) => problems.push(String(error.message).slice(0, 160)));

const heading = (text) => page.getByRole("heading", { name: text, exact: false }).first();
const visible = (locator) => locator.waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
const alert = () => page.locator('.inline-notice[role="alert"]').first();

try {
  await page.goto(`${BASE}/signup`);
  await page.fill("#auth-name", "Portal Tester");
  await page.fill("#auth-email", editorEmail);
  await page.fill("#auth-password", password);
  await page.click('button[type="submit"]:not(.admin-danger)');
  await visible(page.getByText("Welcome back, Portal Tester").first());
  const [{ id: userId }] = await owner`select id from neon_auth."user" where email = ${editorEmail}`;

  await page.goto(`${BASE}/admin/projects`);
  check("ordinary member is refused the portal", await visible(heading("That page isn't here")) && (await page.getByText("Manager portal").count()) === 0);

  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'support')`;
  await page.goto(`${BASE}/admin`);
  check("support staff can open the dashboard", await visible(heading("Dashboard")));
  await page.goto(`${BASE}/admin/projects/new`);
  await visible(heading("That page isn't here"));
  check("support staff cannot manage projects", (await page.locator("#project-title").count()) === 0);
  await owner`delete from public.user_roles where user_id = ${userId}`;
  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'editor')`;

  await page.goto(`${BASE}/admin`);
  await visible(heading("Dashboard"));
  const totalCard = page.locator(".admin-stat-card", { hasText: "Total projects" }).locator("strong");
  const before = Number(await totalCard.textContent());
  check("dashboard shows real counts", before >= 0 && !Number.isNaN(before), `${before} projects`);
  check("sample figures are gone", (await page.getByText("Illustrative").count()) === 0 && (await page.getByText("Preview only").count()) === 0);

  await page.goto(`${BASE}/admin/projects/new`);
  await page.fill("#project-title", title);
  check("web address is suggested from the title", (await page.inputValue("#project-slug")) === slug);
  await page.fill("#project-summary", "A summary written in the manager portal.");
  await page.fill("#project-description", "The full story of this project.");
  await page.fill("#project-technologies", `${tech}, ${tech}`);
  await page.fill("#project-started", "2026-05-01");
  await page.fill("#project-completed", "2026-01-01");
  await page.click('button[type="submit"]:not(.admin-danger)');
  check("impossible dates are refused", (await visible(alert())) && (await alert().textContent()).includes("before the start date"));

  await page.fill("#project-completed", "");
  if ((await page.inputValue("#project-title")) === "") {
    await page.fill("#project-title", title);
    await page.fill("#project-slug", slug);
    await page.fill("#project-summary", "A summary written in the manager portal.");
    await page.fill("#project-description", "The full story of this project.");
    await page.fill("#project-technologies", `${tech}, ${tech}`);
  }
  await page.click('button[type="submit"]:not(.admin-danger)');
  await page.waitForURL("**/admin/projects", { timeout: WAIT }).catch(() => {});
  check("new project is created", await visible(page.getByText(title).first()), page.url());

  check("draft is hidden from the public API", (await publicApi(slug)).status === 404);
  const [row] = await owner`select id, visibility, created_by, published_at from public.projects where slug = ${slug}`;
  check("draft is saved with its creator and no publish date", row?.visibility === "draft" && row?.created_by === userId && row?.published_at === null);

  await page.goto(`${BASE}/admin/projects/${row.id}`);
  await page.selectOption("#project-visibility", "public");
  await page.selectOption("#project-status", "live");
  await page.check('input[name="is_featured"]');
  await page.fill("#project-demo", "javascript:alert(1)");
  await page.evaluate(() => document.querySelector("form.admin-form").setAttribute("novalidate", ""));
  await page.click('button[type="submit"]:not(.admin-danger)');
  check("dangerous link is refused by the server", (await visible(alert())) && (await alert().textContent()).includes("https://"));

  await page.goto(`${BASE}/admin/projects/${row.id}`);
  await page.selectOption("#project-visibility", "public");
  await page.selectOption("#project-status", "live");
  await page.check('input[name="is_featured"]');
  await page.fill("#project-demo", "https://example.com/demo");
  await page.fill("#project-repository", "https://example.com/private-repo");
  await page.click('button[type="submit"]:not(.admin-danger)');
  await page.waitForURL("**/admin/projects", { timeout: WAIT }).catch(() => {});

  const published = await publicApi(slug);
  const json = await published.json().catch(() => ({}));
  check("published project reaches the public API", published.status === 200 && json.data?.status === "Live", `${published.status}`);
  check("technologies are saved without duplicates", JSON.stringify(json.data?.stack) === JSON.stringify([tech]), JSON.stringify(json.data?.stack));
  check("source code link stays private", !JSON.stringify(json).includes("private-repo"));

  const publicPage = await (await fetch(`${BASE}/projects/${slug}`)).text();
  check("public page appears immediately", publicPage.includes(title) && publicPage.includes("The full story of this project."));
  check("public page has the live demo link", publicPage.includes("https://example.com/demo"));
  check("public page has no sample filler", !/illustrative|sample portfolio content|Not configured/i.test(publicPage));
  const home = await (await fetch(`${BASE}/`)).text();
  check("featured project appears on the home page", home.includes(title));

  await page.goto(`${BASE}/admin/projects/new`);
  await page.fill("#project-title", `${title} copy`);
  await page.fill("#project-slug", slug);
  await page.fill("#project-summary", "Copy");
  await page.click('button[type="submit"]:not(.admin-danger)');
  check("duplicate web address is refused", (await visible(alert())) && (await alert().textContent()).includes("already uses"));

  await page.goto(`${BASE}/admin`);
  await visible(heading("Dashboard"));
  check("dashboard count went up by one", Number(await totalCard.textContent()) === before + 1);

  const audit = await owner`select action from public.audit_logs where metadata->>'slug' = ${slug} order by created_at`;
  check("changes are in the audit log", audit.map((a) => a.action).join() === "project.created,project.updated", audit.map((a) => a.action).join());
  const [actor] = await owner`select count(*)::int n from public.audit_logs where metadata->>'slug' = ${slug} and actor_user_id = ${userId}`;
  check("audit log names who did it", actor.n === audit.length);

  await page.goto(`${BASE}/admin/projects/${row.id}`);
  await page.click('button:has-text("Delete project")');
  await page.waitForURL("**/admin/projects", { timeout: WAIT }).catch(() => {});
  check("delete removes it from the public API", (await publicApi(slug)).status === 404);
  const [gone] = await owner`select count(*)::int n from public.projects where slug = ${slug}`;
  check("delete removes it from the database", gone.n === 0);
  const deletes = await owner`select count(*)::int n from public.audit_logs where metadata->>'slug' = ${slug} and action = 'project.deleted'`;
  check("delete is in the audit log", deletes[0].n === 1);
  check("no browser errors", problems.length === 0, problems[0] ?? "");
} catch (error) {
  check("browser run completed", false, String(error.message).slice(0, 240));
} finally {
  await browser.close();
  await owner`delete from public.projects where slug = ${slug}`;
  await owner`delete from public.technologies where name = ${tech}`;
  await owner`delete from public.audit_logs where metadata->>'slug' = ${slug}`;
  const removed = await owner`delete from neon_auth."user" where email = ${editorEmail} returning id`;
  await owner`delete from app_private.rate_limits`;
  const [left] = await owner`select (select count(*)::int from public.user_roles) as roles, (select count(*)::int from neon_auth."user" where email like 'padmore-e2e-%') as users`;
  console.log(`cleanup: ${removed.length} account deleted; test users ${left.users}; role rows ${left.roles} (yours is 1)`);
}

console.log(`pass ${passed} fail ${failed}`);
process.exitCode = failed ? 1 : 0;
