// Drives the real forms in Microsoft Edge against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:forms                (in another)
//
// Creates one throwaway account and always deletes it. Prints how long each step
// took, because sign-in makes several calls to Neon Auth. Clears rate-limit
// counters, which is why it refuses to run against anything except localhost.
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

const email = `padmore-e2e-${randomBytes(4).toString("hex")}@example.com`;
const password = randomBytes(18).toString("base64url");
const WAIT = 75_000;
const GREETING = "Welcome back, Browser Test";

let passed = 0;
let failed = 0;
function check(name, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", name, detail);
}

async function timed(work) {
  const started = Date.now();
  const result = await work();
  return { result, seconds: `${((Date.now() - started) / 1000).toFixed(1)}s` };
}

await owner`delete from neon_auth."user" where email like 'padmore-e2e-%'`;
await owner`delete from app_private.rate_limits`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const problems = [];
page.on("console", (message) => { if (message.type() === "error") problems.push(message.text().slice(0, 160)); });
page.on("pageerror", (error) => problems.push(String(error.message).slice(0, 160)));

// Next.js adds its own hidden role="alert" element, so match this app's notices only.
const alert = () => page.locator('.inline-notice[role="alert"]').first();
const status = () => page.locator('.inline-notice[role="status"]').first();
const textOf = (locator) => locator.waitFor({ timeout: WAIT }).then(() => locator.textContent()).catch(() => "");
const reachedDashboard = () => page.getByText(GREETING).first().waitFor({ timeout: WAIT }).then(() => true).catch(() => false);
const fill = async (fields) => { for (const [selector, value] of Object.entries(fields)) await page.fill(selector, value); };
const submit = () => page.click('button[type="submit"]');
async function signOut() {
  await page.click('button:has-text("Sign out")', { timeout: WAIT });
  await page.waitForURL(`${BASE}/`, { timeout: WAIT }).catch(() => {});
}

try {
  await page.goto(`${BASE}/signup`);
  await fill({ "#auth-name": "Browser Test", "#auth-email": email, "#auth-password": "short" });
  await submit();
  await page.waitForTimeout(500);
  check("browser blocks a short password", page.url().endsWith("/signup"));

  await page.fill("#auth-password", password);
  await submit();
  const signUp = await timed(reachedDashboard);
  check("sign-up form reaches a personal dashboard", signUp.result, signUp.seconds);

  const out = await timed(signOut);
  check("sign-out button returns home", page.url() === `${BASE}/`, out.seconds);

  await page.goto(`${BASE}/dashboard`);
  await page.waitForURL("**/signin**", { timeout: WAIT }).catch(() => {});
  check("signed-out browser cannot open the dashboard", page.url().includes("/signin"));

  await page.goto(`${BASE}/signin`);
  await fill({ "#auth-email": email, "#auth-password": password });
  await submit();
  const signIn = await timed(reachedDashboard);
  check("sign-in form reaches the dashboard", signIn.result, signIn.seconds);
  if (signIn.result) await signOut();

  await page.goto(`${BASE}/signin`);
  await fill({ "#auth-email": email, "#auth-password": "wrong-password-123" });
  await submit();
  const wrong = await timed(() => textOf(alert()));
  check("wrong password shows a neutral error", wrong.result?.includes("didn't match"), wrong.seconds);

  await fill({ "#auth-email": email, "#auth-password": password });
  await submit();
  const retry = await timed(reachedDashboard);
  check("correct password works straight after a wrong one", retry.result, retry.seconds);
  if (retry.result) await signOut();

  await page.goto(`${BASE}/signin`);
  await page.click('a:has-text("Forgot your password?")');
  await page.waitForURL("**/forgot-password", { timeout: WAIT }).catch(() => {});
  check("sign-in page links to recovery", page.url().endsWith("/forgot-password"));

  await page.fill("#reset-email", "padmore-no-such-user@example.com");
  await submit();
  const unknown = await timed(() => textOf(status()));
  check("recovery form answers for an unknown email", unknown.result?.includes("If an account exists"), unknown.seconds);

  await page.goto(`${BASE}/forgot-password`);
  await page.fill("#reset-email", email);
  await submit();
  check("known email gets the identical answer", (await textOf(status())) === unknown.result);

  await page.goto(`${BASE}/reset-password`);
  const noToken = page.getByText("This reset link is invalid").first();
  check("reset page without a token explains itself", await noToken.waitFor({ timeout: WAIT }).then(() => true).catch(() => false));

  await page.goto(`${BASE}/reset-password?token=not-a-real-token`);
  await page.fill("#reset-password", "another-long-password");
  await submit();
  check("forged reset token is refused", (await textOf(alert()))?.includes("invalid or has expired"));

  const blocked = problems.filter((problem) => /Content Security Policy|Refused to/i.test(problem));
  check("no content security policy violations", blocked.length === 0, blocked[0] ?? "");
} catch (error) {
  check("browser run completed", false, String(error.message).slice(0, 220));
} finally {
  await browser.close();
  const removed = await owner`delete from neon_auth."user" where email = ${email} returning id`;
  await owner`delete from app_private.rate_limits`;
  console.log(`cleanup: ${removed.length} account deleted`);
}

console.log(`pass ${passed} fail ${failed}`);
process.exitCode = failed ? 1 : 0;
