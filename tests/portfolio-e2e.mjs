// Checks public portfolio data against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:portfolio            (in another)
//
// Adds one hidden project of each kind and always removes them at the end.
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
if (!/^http:\/\/localhost(:\d+)?$/.test(BASE)) throw new Error("E2E tests only run against localhost");

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
);
const owner = neon(env.DATABASE_URL);

let passed = 0;
let failed = 0;
function check(name, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", name, detail);
}

const run = randomBytes(4).toString("hex");
const hidden = {
  draft: `e2e-draft-${run}`,
  private: `e2e-private-${run}`,
  future: `e2e-future-${run}`,
  archived: `e2e-archived-${run}`,
};

try {
  const list = await fetch(`${BASE}/api/v1/projects`);
  const { data } = await list.json();
  check("project list comes from the database", list.status === 200 && data.length >= 6, `${data.length} projects`);
  check("technologies are attached", data.every((project) => project.stack.length > 0));
  check("only allowlisted fields are returned", data.every((project) => !("id" in project) && !("createdBy" in project) && !("repositoryUrl" in project)));
  check("featured projects still flagged", data.filter((project) => project.featured).length === 4);

  const limited = await (await fetch(`${BASE}/api/v1/projects?limit=2`)).json();
  check("limit is honoured", limited.data.length === 2);
  check("oversized limit is rejected", (await fetch(`${BASE}/api/v1/projects?limit=100000`)).status === 400);
  check("bad slug is a 404", (await fetch(`${BASE}/api/v1/projects/${encodeURIComponent("x' OR '1'='1")}`)).status === 404);
  check("injection attempt in limit is rejected", (await fetch(`${BASE}/api/v1/projects?limit=${encodeURIComponent("1;drop table projects")}`)).status === 400);

  await owner`insert into public.projects (title, slug, visibility, lifecycle_status, published_at) values
    ('Hidden', ${hidden.draft}, 'draft', 'idea', null),
    ('Hidden', ${hidden.private}, 'private', 'live', now() - interval '1 day'),
    ('Hidden', ${hidden.future}, 'public', 'live', now() + interval '1 day'),
    ('Hidden', ${hidden.archived}, 'public', 'archived', now() - interval '1 day')`;
  for (const [kind, slug] of Object.entries(hidden)) {
    check(`${kind} project is hidden from the API`, (await fetch(`${BASE}/api/v1/projects/${slug}`)).status === 404);
    const html = await (await fetch(`${BASE}/projects/${slug}`)).text();
    check(`${kind} project is hidden from its page`, !html.includes(">Hidden<"));
  }
  const after = await (await fetch(`${BASE}/api/v1/projects`)).json();
  check("hidden projects are not listed", !after.data.some((project) => Object.values(hidden).includes(project.slug)));

  const achievements = await (await fetch(`${BASE}/api/v1/achievements`)).json();
  check("achievements come from the database", achievements.data.length >= 4, `${achievements.data.length}`);

  for (const path of ["/", "/projects", "/projects/e-commerce-platform", "/profile", "/achievements", "/hosted-apps"]) {
    const response = await fetch(`${BASE}${path}`);
    check(`page renders: ${path}`, response.status === 200, `${response.status}`);
  }
  const home = await (await fetch(`${BASE}/`)).text();
  check("home shows database projects", home.includes("E-Commerce Platform") && home.includes("Weather Dashboard"));
  check("no secrets in public pages", !/npg_|DATABASE_|NEON_AUTH_COOKIE|neondb_owner|app_server/.test(home));
} catch (error) {
  check("test run completed", false, String(error.message).slice(0, 200));
} finally {
  const removed = await owner`delete from public.projects where slug like ${`e2e-%-${run}`} returning id`;
  console.log(`cleanup: ${removed.length} hidden projects removed`);
}

console.log(`pass ${passed} fail ${failed}`);
process.exitCode = failed ? 1 : 0;
