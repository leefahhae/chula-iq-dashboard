// ---------------------------------------------------------------------------
// A lightweight, single-shared-password gate for the whole app.
//
// This is intentionally simple: there is one password (set via the
// APP_PASSWORD environment variable) shared by every admin, no individual
// accounts, and no database. It exists purely to stop random visitors who
// stumble on the URL from seeing the institute's financial data — it is
// NOT meant to withstand a determined attacker. If per-admin accounts or
// audit logging are ever needed, this should be replaced with a real auth
// provider (e.g. NextAuth/Auth.js) backed by a database.
//
// Uses Web Crypto (`crypto.subtle`), which is available in both the Node.js
// runtime (API routes) and the Edge runtime (middleware), so the exact same
// hashing logic can run in both places without pulling in Node's `crypto`
// module (which Edge middleware can't use).
// ---------------------------------------------------------------------------

export const AUTH_COOKIE = "chula_iq_session";

const SALT = "chula-iq-session-salt-v1";

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:${SALT}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedSessionValue(): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password) return null;
  return hashPassword(password);
}
