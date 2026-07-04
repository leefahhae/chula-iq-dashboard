import "server-only";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Server-only Supabase client. The `server-only` import above makes it a
// build error to accidentally import this file from a "use client" component
// — every database access must go through a Route Handler (app/api/**) so the
// service-role key (which bypasses Row Level Security) never reaches the
// browser bundle. Client components call the API routes with normal fetch()
// instead of importing this file.
// ---------------------------------------------------------------------------

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. " +
        "Set them in .env.local (dev) or your Vercel project's Environment Variables (production)."
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
