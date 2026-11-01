// End-to-end auth and access checks against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:e2e                  (in another)
//
// Creates one throwaway account through the real sign-up flow, and always
// deletes it at the end. Passwords, tokens and connection strings are never
// printed. Clears rate-limit counters so that repeated runs start clean, which
// is why it refuses to run against anything except localhost.
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
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

const email = `padmore-e2e-${randomBytes(4).toString("hex")}@example.com`;
const password = randomBytes(24).toString("base64url");

let passed = 0;
let failed = 0;
function check(name, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", name, detail);
}

const jar = new Map();
function keepCookies(response) {
  for (const header of response.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const index = pair.indexOf("=");
    const value = pair.slice(index + 1);
    if (value) jar.set(pair.slice(0, index), value);
    else jar.delete(pair.slice(0, index));
  }
}
const cookieHeader = () => [...jar].map(([key, value]) => `${key}=${value}`).join("; ");
const get = (path, cookie) => fetch(`${BASE}${path}`, { redirect: "manual", headers: cookie ? { cookie } : {} });
const post = (path, body, headers = {}) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/json", origin: BASE, ...headers },
    body: JSON.stringify(body),
  });

// The root loading.tsx streams, so a blocked page can still answer HTTP 200.
// The real question is whether admin content reached the response.
async function adminPage(cookie) {
  const response = await get("/admin", cookie);
  const html = await response.text();
  return {
    status: response.status,
    hasContent: html.includes("Portfolio Admin") || html.includes("Total users"),
    notFound: /NEXT_HTTP_ERROR_FALLBACK;404|could not be found|not found/i.test(html),
    redirected: response.status >= 300 && response.status < 400,
  };
}

await owner`delete from app_private.rate_limits`;

try {
  let response = await get("/dashboard");
  check("guest sent from dashboard to sign-in", response.status === 307 && (response.headers.get("location") ?? "").includes("/signin"), `${response.status}`);

  let admin = await adminPage();
  check("guest gets no admin content", admin.redirected && !admin.hasContent, `${admin.status}`);

  response = await get("/");
  check("public home still open", response.status === 200, `${response.status}`);

  const signUp = await post("/api/auth/sign-up/email", { name: "E2E", email, password });
  keepCookies(signUp);
  const account = await signUp.json().catch(() => ({}));
  check("sign-up through the app works", signUp.status === 200, `emailVerified=${account.user?.emailVerified} session=${Boolean(account.token)}`);
  const userId = account.user?.id;

  response = await get("/dashboard", cookieHeader());
  keepCookies(response);
  const dashboard = await response.text();
  check("signed-in user reaches dashboard", response.status === 200 && dashboard.includes("Welcome back"), `${response.status}`);
  check("private page is not cacheable", /no-store/.test(response.headers.get("cache-control") ?? ""));
  check("no secrets in page", !/npg_|DATABASE_|NEON_AUTH_COOKIE|neondb_owner|app_server/.test(dashboard));

  admin = await adminPage(cookieHeader());
  check("ordinary user gets no admin content", !admin.hasContent && admin.notFound, `http ${admin.status}, notFound=${admin.notFound}`);

  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'editor')`;
  admin = await adminPage(cookieHeader());
  check("real token + editor role shows admin content", admin.hasContent, `http ${admin.status}`);

  await owner`delete from public.user_roles where user_id = ${userId}`;
  admin = await adminPage(cookieHeader());
  check("removing the role takes effect immediately", !admin.hasContent, `http ${admin.status}`);

  response = await get("/dashboard", "garbage=1");
  check("invalid cookie is rejected", response.status === 307, `${response.status}`);

  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'owner')`;
  const forged = [...jar].map(([key, value]) => `${key}=${value.slice(0, 8)}TAMPERED${value.slice(16)}`).join("; ");
  admin = await adminPage(forged);
  check("tampered session cannot reach admin, even for an owner", !admin.hasContent, `http ${admin.status}`);
  response = await get("/dashboard", forged);
  check("tampered session cannot reach dashboard", !(await response.text()).includes("Welcome back"), `${response.status}`);

  const copied = cookieHeader();
  const signOut = await post("/api/auth/sign-out", {}, { cookie: copied });
  keepCookies(signOut);
  response = await get("/dashboard", copied);
  check("copied cookies die at sign-out: dashboard", !(await response.text()).includes("Welcome back"), `signout ${signOut.status}, dashboard ${response.status}`);
  admin = await adminPage(copied);
  check("copied cookies die at sign-out: admin with owner role", !admin.hasContent, `http ${admin.status}`);

  response = await post("/api/auth/sign-in/email", { email, password }, { origin: "https://evil.example" });
  check("sign-in from a foreign origin refused", response.status >= 400, `${response.status}`);

  const attempts = [];
  for (let attempt = 0; attempt < 24; attempt++) {
    const denied = await post("/api/auth/sign-in/email", { email, password: "wrong-password-123" });
    const message = (await denied.json().catch(() => ({}))).message ?? "";
    attempts.push(`${denied.status}: ${message.slice(0, 45)}`);
  }
  const groups = new Map();
  attempts.forEach((result, index) => groups.set(result, [...(groups.get(result) ?? []), index + 1]));
  for (const [result, numbers] of groups) console.log(`     attempts ${numbers[0]}-${numbers.at(-1)} (${numbers.length}x) -> ${result}`);
  check("repeated bad sign-ins are blocked", attempts.some((result) => result.startsWith("429")) && !attempts.some((result) => result.startsWith("200")));
  check("this app's own limiter responds", attempts.some((result) => result.includes("Too many attempts. Please try")));
} catch (error) {
  check("test run completed", false, String(error.message).slice(0, 200));
} finally {
  const deleted = await owner`delete from neon_auth."user" where email = ${email} returning id`;
  await owner`delete from app_private.rate_limits`;
  const [left] = await owner`
    select
      (select count(*)::int from neon_auth."user" where email like 'padmore-e2e-%') as users,
      (select count(*)::int from public.user_roles) as roles`;
  console.log(`cleanup: ${deleted.length} account deleted; test users left ${left.users}; role rows ${left.roles}`);
}

console.log(`pass ${passed} fail ${failed}`);
process.exitCode = failed ? 1 : 0;
