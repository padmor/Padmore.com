// Confirms each connection in .env still works. Prints no secrets.
//   node scripts/db-check.mjs
import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";

config({ quiet: true });

async function check(label, url) {
  if (!url) return console.log(`${label}: EMPTY`);
  const parsed = new URL(url);
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 25_000 });
  // Unhandled, a dropped connection crashes with a dump that includes the password.
  pool.on("error", () => {});
  try {
    const { rows } = await pool.query("select current_user as role, current_setting('neon.branch_id', true) as branch");
    console.log(`${label}: OK as ${rows[0].role} on ${rows[0].branch} | sslmode=${parsed.searchParams.get("sslmode")} | pooler=${parsed.hostname.includes("-pooler")}`);
  } catch (error) {
    console.log(`${label}: FAILED | ${String(error.message).replaceAll(parsed.password, "[hidden]").slice(0, 120)}`);
  } finally {
    await pool.end().catch(() => {});
  }
}

await check("DATABASE_URL", process.env.DATABASE_URL);
await check("DATABASE_SERVER_URL", process.env.DATABASE_SERVER_URL);

// A valid API rejects this made-up token itself rather than failing on its own login.
const api = await fetch(`${process.env.NEON_DATA_API_URL}/projects?limit=1`, {
  headers: { Authorization: "Bearer not.a.jwt" },
}).catch((error) => ({ status: `error ${error.message}`, text: async () => "" }));
console.log(`Data API: http ${api.status} | ${(await api.text()).slice(0, 90)}`);
