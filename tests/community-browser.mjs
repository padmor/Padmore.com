// Drives the Community and the Achievements files in Microsoft Edge against a running local build:
//   npm run build && npm start        (in one terminal)
//   npm run test:community            (in another)
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
const email = `padmore-e2e-community-${run}@example.com`;
const password = randomBytes(18).toString("base64url");
const WAIT = 45_000;
const SAVE = 'button[type="submit"]:not(.admin-danger)';
const postTitle = `E2E post ${run}`;
const postText = "Details with <script>window.__xss=1</script> in them";
const replyText = `E2E reply ${run}`;
const certificate = `E2E Certificate ${run}`;
const tutorialTitle = `E2E Tutorial ${run}`;
const tutorialSlug = `e2e-tutorial-${run}`;

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  condition ? passed++ : failed++;
  console.log(condition ? "ok  " : "FAIL", label, detail);
}
const html = async (path) => (await fetch(`${BASE}${path}`)).text();

await owner`delete from neon_auth."user" where email like 'padmore-e2e-community-%'`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const memberContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await memberContext.newPage();
page.setDefaultTimeout(WAIT);
page.on("dialog", (dialog) => dialog.accept());
const problems = [];
page.on("pageerror", (error) => problems.push(String(error.message).slice(0, 160)));

const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("....word/document.xml....")]);
const png = Buffer.concat([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==", "base64"), Buffer.from(run)]);

try {
  // ---- A member signs up and uses the community
  await page.goto(`${BASE}/signup`);
  await page.fill("#auth-name", "Community Tester");
  await page.fill("#auth-email", email);
  await page.fill("#auth-password", password);
  await page.click(SAVE);
  await page.getByText("Welcome back, Community Tester").first().waitFor();
  const [{ id: userId }] = await owner`select id from neon_auth."user" where email = ${email}`;

  await page.goto(`${BASE}/community`);
  await page.getByRole("button", { name: "Create a post" }).waitFor();
  check("member sees the Create a post bar", await page.getByRole("button", { name: "Create a post" }).isVisible());
  await page.getByRole("button", { name: "Create a post" }).click();
  check("Post is off while the form is empty", await page.getByRole("button", { name: "Post", exact: true }).isDisabled());
  await page.fill("#community-title", postTitle);
  await page.fill("#community-body", postText);
  await page.getByRole("button", { name: "Post", exact: true }).click();
  const post = page.locator("article", { hasText: `E2E post ${run}` });
  await post.waitFor();
  check("post appears in the feed under the member's name", (await post.textContent()).includes("Community Tester"));
  check("markup in a post is shown as text, never run", (await post.textContent()).includes("<script>") && (await page.evaluate(() => window.__xss)) === undefined);
  check("the form closes after posting", (await page.locator("#community-title").count()) === 0 && (await page.getByRole("button", { name: "Create a post" }).isVisible()));
  check("the title is stored", (await owner`select title from public.community_posts where author_name = 'Community Tester' order by created_at desc limit 1`)[0]?.title === postTitle);

  await post.getByRole("button", { name: "Upvote this post" }).click();
  await post.getByRole("button", { name: "Remove upvote" }).waitFor();
  check("upvoting works", await post.getByLabel("1 upvote").isVisible());
  await post.getByRole("button", { name: "Remove upvote" }).click();
  await post.getByRole("button", { name: "Upvote this post" }).waitFor();
  check("removing the upvote works", await post.getByLabel("0 upvotes").isVisible());

  await post.getByRole("button", { name: /repl/ }).click();
  await post.locator('input[placeholder="Write a reply…"]').fill(replyText);
  await post.getByRole("button", { name: "Send reply" }).click();
  await post.getByText(replyText).waitFor();
  check("reply appears under the post", true);
  const [{ n: storedPosts }] = await owner`select count(*)::int as n from public.community_posts where user_id = ${userId}`;
  check("the post is stored against the member", storedPosts === 1);

  // ---- A visitor who is not signed in can read, and is asked to sign in only when they try to take part
  const guestContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const guest = await guestContext.newPage();
  guest.setDefaultTimeout(WAIT);
  await guest.goto(`${BASE}/community`, { waitUntil: "domcontentloaded" });
  const guestPost = guest.locator("article", { hasText: `E2E post ${run}` });
  await guestPost.waitFor();
  check("a visitor can read the community", true);
  check("no create-account block is on the page", (await guest.getByText("Join the conversation").count()) === 0 && !(await guest.getByRole("link", { name: "Create an account" }).isVisible()));
  check("a visitor sees no delete buttons", (await guest.getByRole("button", { name: /Delete this/ }).count()) === 0);
  const toSignIn = async (what, act) => {
    await act();
    await guest.waitForURL(/\/signin\?next=/);
    check(`${what} sends the visitor to the sign-in page, which returns here`, decodeURIComponent(guest.url()).includes("next=/community"));
    await guest.goBack({ waitUntil: "domcontentloaded" });
  };
  await toSignIn("trying to post", () => guest.getByRole("button", { name: "Create a post" }).click());
  await toSignIn("trying to vote", () => guestPost.getByRole("button", { name: "Upvote this post" }).click());
  await toSignIn("trying to reply", async () => {
    await guestPost.getByRole("button", { name: /repl/ }).click();
    await guestPost.getByRole("button", { name: "Write a reply…" }).click();
  });
  await guestContext.close();

  // ---- The member can remove their own reply and post
  await page.reload();
  const again = page.locator("article", { hasText: `E2E post ${run}` });
  await again.getByRole("button", { name: /repl/ }).click();
  await again.getByRole("button", { name: "Delete this reply" }).click();
  await again.getByText(replyText).waitFor({ state: "detached" });
  check("a member can delete their reply", true);
  await again.getByRole("button", { name: "Delete this post" }).click();
  await again.waitFor({ state: "detached" });
  const [{ n: left }] = await owner`select count(*)::int as n from public.community_posts where user_id = ${userId}`;
  check("a member can delete their post", left === 0);

  // ---- Follow, and the schools and programmes place on About me
  const aboutHtml = await html("/about");
  check("About me has its schools and programmes section", aboutHtml.includes("Schools and programmes"));

  await page.goto(`${BASE}/about`);
  const startCount = (await owner`select count(*)::int as n from public.site_followers`)[0].n;
  const followers = (n) => `${n} ${n === 1 ? "follower" : "followers"}`;
  const followButton = page.getByRole("button", { name: "Follow", exact: true });
  await followButton.waitFor();
  // The button is disabled until the page has read the follower count and who is signed in.
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((button) => button.textContent === "Follow" && !button.disabled));
  await followButton.click();
  await page.getByRole("button", { name: "Following", exact: true }).waitFor();
  check("a member can follow, and the follower count updates", await page.getByText(followers(startCount + 1), { exact: true }).isVisible());
  check("the follow is stored", (await owner`select count(*)::int as n from public.site_followers where user_id = ${userId}`)[0].n === 1);
  await page.reload();
  await page.getByRole("button", { name: "Following", exact: true }).waitFor();
  check("the follow is remembered after reloading", true);

  const visitor = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  visitor.setDefaultTimeout(WAIT);
  await visitor.goto(`${BASE}/about`, { waitUntil: "domcontentloaded" });
  await visitor.getByText(followers(startCount + 1), { exact: true }).waitFor();
  check("a visitor sees the follower count", true);
  await visitor.getByRole("button", { name: "Follow", exact: true }).click();
  const followPrompt = visitor.getByRole("dialog");
  await followPrompt.waitFor();
  check("pressing Follow asks a visitor to sign in", (await followPrompt.textContent()).includes("Sign in to follow Padmore"));
  await visitor.context().close();

  await page.getByRole("button", { name: "Following", exact: true }).click();
  await page.getByRole("button", { name: "Follow", exact: true }).waitFor();
  check("a member can unfollow", (await owner`select count(*)::int as n from public.site_followers where user_id = ${userId}`)[0].n === 0 && await page.getByText(followers(startCount), { exact: true }).isVisible());

  // ---- Achievement files, as an admin
  await owner`insert into public.user_roles (user_id, role) values (${userId}, 'admin')`;
  await page.goto(`${BASE}/admin/achievements/new`);
  await page.fill("#content-title", certificate);
  await page.locator("#content-category").selectOption("certificate");
  await page.fill("#content-organization", "E2E Academy");
  await page.check('input[name="is_published"]');
  await page.click(SAVE);
  await page.waitForURL("**/admin/achievements", { timeout: WAIT });
  await page.locator("tr", { hasText: certificate }).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/achievements\/[0-9a-f-]{36}$/);
  const [{ id: achievementId }] = await owner`select id from public.achievements where title = ${certificate}`;
  check("category is saved", (await owner`select category from public.achievements where id = ${achievementId}`)[0].category === "certificate");

  const attach = async (title, file, video = "") => {
    await page.fill("#file-title", title);
    if (file) await page.setInputFiles("#file-upload", file);
    if (video) await page.fill("#file-video", video);
    await page.getByRole("button", { name: "Attach", exact: true }).click();
  };
  const notice = async () => (await page.locator('.inline-notice').last().textContent({ timeout: WAIT }))?.trim() ?? "";

  await attach("E2E PDF", { name: "certificate.pdf", mimeType: "application/pdf", buffer: pdf });
  await page.getByText("Added.").waitFor();
  check("a PDF can be attached", (await owner`select count(*)::int as n from public.achievement_files where achievement_id = ${achievementId} and title = 'E2E PDF' and mime_type = 'application/pdf'`)[0].n === 1);

  await attach("E2E Fake", { name: "fake.pdf", mimeType: "application/pdf", buffer: Buffer.from("this is only text") });
  check("a fake PDF is refused", (await notice()).startsWith("Use a PDF"));
  await attach("E2E Big", { name: "big.pdf", mimeType: "application/pdf", buffer: Buffer.concat([pdf, Buffer.alloc(4 * 1024 * 1024)]) });
  check("a file over 4 MB is refused", (await notice()).includes("up to 4 MB"));
  await attach("E2E Bad link", null, "https://evil.example.com/watch?v=dQw4w9WgXcQ");
  check("a video link from another site is refused", (await notice()).startsWith("Paste a YouTube or Vimeo link"));

  await attach("E2E Word", { name: "cv.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: docx });
  await page.getByText("Added.").waitFor();
  await attach("E2E Image", { name: "badge.png", mimeType: "image/png", buffer: png });
  await page.getByText("Added.").waitFor();
  await attach("E2E Video", null, "https://youtu.be/dQw4w9WgXcQ");
  await page.getByText("Added.").waitFor();
  const stored = await owner`select kind, video_url from public.achievement_files where achievement_id = ${achievementId} order by created_at`;
  check("PDF, Word, image and video are all stored", stored.map((row) => row.kind).join() === "document,document,image,video");
  check("a video link is stored in its standard form", stored[3].video_url === "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  const achievementsPage = await html("/achievements");
  check("the Achievements page lists the item, its type and its files", [certificate, "Certificate", "E2E PDF", "E2E Word", "E2E Image", "E2E Video"].every((text) => achievementsPage.includes(text)));

  const files = Object.fromEntries((await owner`select title, id from public.achievement_files where achievement_id = ${achievementId}`).map((row) => [row.title, row.id]));
  const pdfResponse = await fetch(`${BASE}/achievement-files/${files["E2E PDF"]}`);
  check("a PDF opens in the browser", pdfResponse.status === 200 && pdfResponse.headers.get("content-type") === "application/pdf" && pdfResponse.headers.get("content-disposition").startsWith("inline") && pdfResponse.headers.get("x-content-type-options") === "nosniff");
  const wordResponse = await fetch(`${BASE}/achievement-files/${files["E2E Word"]}`);
  check("a Word document downloads instead of opening", wordResponse.status === 200 && wordResponse.headers.get("content-disposition").startsWith("attachment"));
  check("a video has no file to download", (await fetch(`${BASE}/achievement-files/${files["E2E Video"]}`)).status === 404);
  check("an unknown file is not found", (await fetch(`${BASE}/achievement-files/00000000-0000-4000-8000-000000000000`)).status === 404);
  check("a bad file address is not found", (await fetch(`${BASE}/achievement-files/not-an-id`)).status === 404);

  await page.locator("li", { hasText: "E2E Word" }).getByRole("button", { name: "Remove" }).click();
  await page.locator("li", { hasText: "E2E Word" }).waitFor({ state: "detached" });
  check("an attached file can be removed", (await owner`select count(*)::int as n from public.achievement_files where achievement_id = ${achievementId} and title = 'E2E Word'`)[0].n === 0);

  await page.locator('input[name="is_published"]').uncheck();
  await page.click(SAVE);
  await page.waitForURL("**/admin/achievements", { timeout: WAIT });
  check("files of an unpublished item are no longer reachable", (await fetch(`${BASE}/achievement-files/${files["E2E PDF"]}`)).status === 404 && !(await html("/achievements")).includes(certificate));

  // ---- Tutorial files, as an admin: any kind of file, or a video link
  await page.goto(`${BASE}/admin/tutorials/new`);
  await page.fill("#content-title", tutorialTitle);
  await page.fill("#content-slug", tutorialSlug);
  await page.fill("#content-excerpt", "A short summary.");
  await page.fill("#content-body", "## Step\n\nBody.");
  await page.fill("#content-minutes", "3");
  await page.selectOption("#content-status", "published");
  await page.click(SAVE);
  await page.waitForURL("**/admin/tutorials", { timeout: WAIT });
  await page.locator("tr", { hasText: tutorialTitle }).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/tutorials\/[0-9a-f-]{36}$/);
  const [{ id: postId }] = await owner`select id from public.posts where slug = ${tutorialSlug}`;

  const pptx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("....ppt/slides/slide1.xml....")]);
  const mp3 = Buffer.concat([Buffer.from("ID3"), Buffer.alloc(2000, 1)]);
  const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0x20]), Buffer.from("ftypisom"), Buffer.alloc(2000, 1)]);

  await attach("E2E Notes", { name: "notes.md", mimeType: "text/markdown", buffer: Buffer.from("# Notes\n\nHello from Markdown.") });
  await page.getByText("Added.").waitFor();
  await attach("E2E Slides", { name: "slides.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", buffer: pptx });
  await page.getByText("Added.").waitFor();
  await attach("E2E Guide", { name: "guide.pdf", mimeType: "application/pdf", buffer: pdf });
  await page.getByText("Added.").waitFor();
  await attach("E2E Audio", { name: "talk.mp3", mimeType: "audio/mpeg", buffer: mp3 });
  await page.getByText("Added.").waitFor();
  await attach("E2E Clip", { name: "clip.mp4", mimeType: "video/mp4", buffer: mp4 });
  await page.getByText("Added.").waitFor();
  await attach("E2E Talk", null, "https://vimeo.com/76979871");
  await page.getByText("Added.").waitFor();
  const tutorialKinds = (await owner`select kind, video_url from public.tutorial_files where post_id = ${postId} order by created_at`);
  check("Markdown, slides, PDF, audio, uploaded video and a video link are all stored", tutorialKinds.map((row) => row.kind).join() === "document,document,document,audio,video,video");
  check("a video link is stored in its standard form", tutorialKinds[5].video_url === "https://vimeo.com/76979871");

  await attach("E2E Fake audio", { name: "song.mp3", mimeType: "audio/mpeg", buffer: Buffer.from("this is only text") });
  check("fake audio is refused", (await notice()).startsWith("Use a PDF"));
  await attach("E2E Page", { name: "page.html", mimeType: "text/html", buffer: Buffer.from("<script>alert(1)</script>") });
  check("a web page is refused", (await notice()).startsWith("Use a PDF"));
  await attach("E2E Big video", { name: "big.mp4", mimeType: "video/mp4", buffer: Buffer.concat([mp4, Buffer.alloc(4 * 1024 * 1024)]) });
  check("a file over 4 MB is refused, with a hint to use a link", (await notice()).includes("up to 4 MB") && (await notice()).includes("YouTube or Vimeo link"));

  const article = await html(`/tutorials/${tutorialSlug}`);
  check("the tutorial page lists its resources", ["Resources", "E2E Notes", "E2E Slides", "E2E Guide", "E2E Audio", "E2E Clip", "E2E Talk"].every((text) => article.includes(text)));
  check("audio and uploaded video play on the page", article.includes("<audio") && article.includes("<video"));
  const tutorialsList = await html("/tutorials");
  check("tutorial cards say what is attached", ["PDF", "Slides", "Audio", "Video", "Notes"].every((label) => tutorialsList.includes(`>${label}<`)));
  const homeHtml = await html("/");
  check("the homepage points to tutorials", homeHtml.includes("Free tutorials and guides") && homeHtml.includes("Latest tutorials"));

  const tutorialFiles = Object.fromEntries((await owner`select title, id from public.tutorial_files where post_id = ${postId}`).map((row) => [row.title, row.id]));
  const fileUrl = (title) => `${BASE}/tutorial-files/${tutorialFiles[title]}`;

  // Signed in (this browser is the admin's own session): documents open and download.
  const md = await page.request.get(fileUrl("E2E Notes"));
  check("Markdown opens as plain text for a member", md.status() === 200 && md.headers()["content-type"].startsWith("text/plain") && md.headers()["content-disposition"].startsWith("inline") && (await md.text()).includes("Hello from Markdown"));
  const slides = await page.request.get(fileUrl("E2E Slides"));
  check("slides download for a member, and are never cached for others", slides.status() === 200 && slides.headers()["content-disposition"].startsWith("attachment") && slides.headers()["cache-control"].startsWith("private"));

  // Not signed in: documents are behind sign-in, audio and video are free.
  for (const title of ["E2E Notes", "E2E Slides", "E2E Guide"]) check(`${title} needs sign-in`, (await fetch(fileUrl(title))).status === 401);
  const audio = await fetch(fileUrl("E2E Audio"));
  check("audio stays free, and is served with a range header so it can seek", audio.status === 200 && audio.headers.get("content-type") === "audio/mpeg" && audio.headers.get("accept-ranges") === "bytes");
  const part = await fetch(fileUrl("E2E Audio"), { headers: { Range: "bytes=0-9" } });
  check("a range request returns just that part", part.status === 206 && part.headers.get("content-range") === "bytes 0-9/2003" && (await part.arrayBuffer()).byteLength === 10);
  check("a range past the end is refused", (await fetch(fileUrl("E2E Audio"), { headers: { Range: "bytes=9999-" } })).status === 416);
  check("a video link has no file to download", (await fetch(fileUrl("E2E Talk"))).status === 404);
  check("an unknown tutorial file is not found", (await fetch(`${BASE}/tutorial-files/00000000-0000-4000-8000-000000000000`)).status === 404);

  // Saving to the account, the dashboard, and what's new since following
  await page.goto(`${BASE}/tutorials/${tutorialSlug}`);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((button) => button.getAttribute("aria-label") === "Save this tutorial" && !button.disabled));
  await page.getByRole("button", { name: "Save this tutorial" }).click();
  await page.getByRole("button", { name: "Remove from saved" }).waitFor();
  check("a member can save a tutorial to their account", (await owner`select count(*)::int as n from public.saved_items where user_id = ${userId} and kind = 'tutorial' and slug = ${tutorialSlug}`)[0].n === 1);
  await page.reload();
  await page.getByRole("button", { name: "Remove from saved" }).waitFor();
  check("the saved tutorial is remembered after reloading", true);

  // Following since before it was published puts it in the feed.
  await owner`insert into public.site_followers (user_id, created_at) values (${userId}, now() - interval '1 day') on conflict (user_id) do update set created_at = excluded.created_at`;
  await page.goto(`${BASE}/dashboard`);
  check("the dashboard lists saved items", (await page.locator("#saved").textContent()).includes(tutorialTitle));
  check("the dashboard shows what is new since following", (await page.locator("#activity").textContent()).includes(tutorialTitle));
  await owner`delete from public.site_followers where user_id = ${userId}`;
  await page.goto(`${BASE}/tutorials/${tutorialSlug}`);
  await page.getByRole("button", { name: "Remove from saved" }).click();
  await page.getByRole("button", { name: "Save this tutorial" }).waitFor();
  check("a member can unsave", (await owner`select count(*)::int as n from public.saved_items where user_id = ${userId}`)[0].n === 0);

  // A visitor: locked downloads, then sign in and come straight back to the tutorial.
  const readerContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const reader = await readerContext.newPage();
  reader.setDefaultTimeout(WAIT);
  await reader.goto(`${BASE}/tutorials/${tutorialSlug}`, { waitUntil: "domcontentloaded" });
  const locked = reader.getByRole("button", { name: "Sign in to download" });
  await locked.first().waitFor();
  check("a visitor sees locked downloads", (await locked.count()) >= 2);
  check("a visitor can still play the audio and video", (await reader.locator("audio").count()) === 1 && (await reader.locator("video").count()) === 1);
  await reader.getByRole("button", { name: "Save this tutorial" }).click();
  check("pressing Save asks a visitor to sign in", (await reader.getByRole("dialog").textContent()).includes("Sign in to save this"));
  await reader.keyboard.press("Escape");
  await locked.first().click();
  const lockedPrompt = reader.getByRole("dialog");
  await lockedPrompt.waitFor();
  check("pressing a locked download asks to sign in", (await lockedPrompt.textContent()).includes("Sign in to download this file"));
  await lockedPrompt.getByRole("link", { name: "Sign in", exact: true }).click();
  await reader.waitForURL(/\/signin\?next=/);
  check("the sign-in page remembers the page the visitor came from", decodeURIComponent(reader.url()).includes(`next=/tutorials/${tutorialSlug}`));
  check("the sign-in page says what an account gives", (await reader.getByText("Download tutorial files, slides and notes").count()) === 1);
  await reader.fill("#auth-email", email);
  await reader.fill("#auth-password", password);
  await reader.click(SAVE);
  await reader.waitForURL(`**/tutorials/${tutorialSlug}`);
  check("after signing in the visitor is back on the tutorial", true);
  await reader.getByRole("link", { name: "Download E2E Slides" }).waitFor();
  check("and the downloads are now open", (await reader.getByRole("button", { name: "Sign in to download" }).count()) === 0);
  await readerContext.close();

  // A crafted return address never leaves the site.
  const probeContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const probe = await probeContext.newPage();
  probe.setDefaultTimeout(WAIT);
  for (const bad of ["//evil.example.com", "https://evil.example.com", "/\\evil.example.com", "javascript:alert(1)"]) {
    await probe.goto(`${BASE}/signin?next=${encodeURIComponent(bad)}`, { waitUntil: "domcontentloaded" });
    check(`a bad return address is dropped (${bad})`, (await probe.locator('input[name="next"]').count()) === 0);
  }
  // Even if someone adds the field by hand, the server only accepts plain pages on this site.
  await probe.goto(`${BASE}/signin`, { waitUntil: "domcontentloaded" });
  await probe.evaluate(() => {
    const input = document.createElement("input");
    input.type = "hidden"; input.name = "next"; input.value = "//evil.example.com";
    document.querySelector("form.auth-form").appendChild(input);
  });
  await probe.fill("#auth-email", email);
  await probe.fill("#auth-password", password);
  await probe.click(SAVE);
  await probe.waitForURL("**/dashboard");
  check("a hand-made return address still lands on the dashboard, on this site", new URL(probe.url()).origin === new URL(BASE).origin);
  await probeContext.close();

  await page.goto(`${BASE}/admin/tutorials/${postId}`);
  await page.locator("li", { hasText: "E2E Notes" }).getByRole("button", { name: "Remove" }).click();
  await page.locator("li", { hasText: "E2E Notes" }).waitFor({ state: "detached" });
  check("an attached tutorial file can be removed", (await owner`select count(*)::int as n from public.tutorial_files where post_id = ${postId} and title = 'E2E Notes'`)[0].n === 0);

  await page.selectOption("#content-status", "draft");
  await page.click(SAVE);
  await page.waitForURL("**/admin/tutorials", { timeout: WAIT });
  check("files of an unpublished tutorial are no longer reachable", (await fetch(fileUrl("E2E Audio"))).status === 404);

  const actions = new Set((await owner`select action from public.audit_logs where actor_user_id = ${userId}`).map((row) => row.action));
  check("attaching and removing files is in the audit log", ["achievement.file_added", "achievement.file_removed", "tutorial.file_added", "tutorial.file_removed"].every((action) => actions.has(action)));
} catch (error) {
  failed++;
  console.log("FAIL unexpected error:", String(error.message ?? error).split("\n")[0]);
} finally {
  await browser.close();
  await owner`delete from public.achievements where title = ${certificate}`;
  await owner`delete from public.posts where slug = ${tutorialSlug}`;
  await owner`delete from public.audit_logs where actor_user_id in (select id from neon_auth."user" where email = ${email})`;
  await owner`delete from public.site_images where uploaded_by in (select id from neon_auth."user" where email = ${email})`;
  const removed = await owner`delete from neon_auth."user" where email = ${email} returning id`;
  const [left] = await owner`select (select count(*)::int from neon_auth."user" where email like 'padmore-e2e-community-%') as users, (select count(*)::int from public.community_posts where author_name = 'Community Tester') as posts, (select count(*)::int from public.achievements where title = ${certificate}) as achievements`;
  console.log(`cleanup: ${removed.length} account deleted; test users ${left.users}; test posts ${left.posts}; test achievements ${left.achievements}`);
  if (problems.length) console.log("page errors:", problems);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
