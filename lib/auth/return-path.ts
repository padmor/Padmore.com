// Where to send someone after they sign in. The address comes from the browser, so
// it is never trusted as it is: only a plain path on this same site is accepted, and
// anything else (another site, a scheme, a trick with slashes) falls back to the dashboard.
export const DEFAULT_RETURN_PATH = "/dashboard";

const ALLOWED = /^\/[A-Za-z0-9\-._~/?=&%+]*$/;
// Pages that would send the person straight back to a sign-in form.
const AUTH_PAGES = /^\/(signin|signup|forgot-password|reset-password)(\/|\?|$)/;

export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 200) return null;
  if (!ALLOWED.test(value) || value.startsWith("//") || value.includes("//")) return null;
  if (AUTH_PAGES.test(value)) return null;

  // Encoded characters are checked after decoding too, so %2f%2f or %5c cannot slip through.
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return null; }
  if (decoded.includes("\\") || decoded.includes("//") || !decoded.startsWith("/") || /[\u0000-\u001f\u007f\s]/.test(decoded)) return null;
  return value;
}

export const returnPathOrDefault = (value: unknown) => safeReturnPath(value) ?? DEFAULT_RETURN_PATH;
