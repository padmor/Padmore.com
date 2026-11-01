import { createNeonAuth } from "@neondatabase/auth/next/server";
import { env } from "@/lib/environment/server";

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
});

// The SDK's token() loses its type under the patched better-auth override.
const sessionAuth = auth as unknown as {
  token(): Promise<{ data: { token?: string } | null }>;
};

// Asks Neon Auth, so this returns null as soon as a session is revoked.
export async function getSessionToken(): Promise<string | null> {
  const { data } = await sessionAuth.token();
  return data?.token ?? null;
}
