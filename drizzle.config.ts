import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ quiet: true });

// Schema tooling runs as the database owner. The app itself never does.
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/schema.ts",
  out: "./db/schema",
  schemaFilter: ["public"],
  dbCredentials: { url: process.env.DATABASE_URL! },
});
