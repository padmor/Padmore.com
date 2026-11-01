import "server-only";
import { z } from "zod";

const schema = z.object({
  APP_URL: z.url({ protocol: /^https?$/ }),
  DATABASE_SERVER_URL: z.string().startsWith("postgresql://"),
  NEON_AUTH_BASE_URL: z.url({ protocol: /^https$/ }),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEON_DATA_API_URL: z.url({ protocol: /^https$/ }),
});

// Reports only variable names, so a failed start can never print a secret.
function load() {
  const parsed = schema.safeParse(process.env);
  if (parsed.success) return parsed.data;
  const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")))];
  throw new Error(`Missing or invalid environment variables: ${names.join(", ")}`);
}

export const env = load();
