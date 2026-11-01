// Applies db/migrations/*.sql in order, each once, as the database owner.
//   node scripts/db-migrate.mjs                    apply what is pending
//   node scripts/db-migrate.mjs --baseline 0003    record up to 0003 as applied
import { readdirSync, readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ quiet: true });

const directory = new URL("../db/migrations/", import.meta.url);
const baselineIndex = process.argv.indexOf("--baseline");
const baseline = baselineIndex > -1 ? process.argv[baselineIndex + 1] : null;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS app_private.schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const { rows } = await pool.query("SELECT name FROM app_private.schema_migrations");
  const applied = new Set(rows.map((row) => row.name));

  for (const name of readdirSync(directory).filter((file) => file.endsWith(".sql")).sort()) {
    if (applied.has(name)) continue;
    if (baseline && name.slice(0, baseline.length) > baseline) break;
    if (!baseline) {
      // Each file holds its own BEGIN and COMMIT, so a failure undoes that file.
      await pool.query(readFileSync(new URL(name, directory), "utf8"));
    }
    await pool.query("INSERT INTO app_private.schema_migrations (name) VALUES ($1)", [name]);
    console.log(`${baseline ? "recorded" : "applied"} ${name}`);
  }
  console.log("migrations up to date");
} finally {
  await pool.end();
}
