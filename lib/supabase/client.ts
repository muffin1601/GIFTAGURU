import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Thrown when the browser bundle was built without Supabase's public config.
 *
 * Distinct from a normal auth failure so callers can tell "this deployment is
 * misconfigured" apart from "this link expired" -- the two look identical to a
 * customer but need completely different fixes.
 */
export class SupabaseConfigError extends Error {
  constructor(missing: string[]) {
    super(`Supabase browser client is not configured. Missing: ${missing.join(", ")}`);
    this.name = "SupabaseConfigError";
  }
}

export function createClient() {
  // Only NEXT_PUBLIC_-prefixed vars are inlined into the browser bundle;
  // the server-only SUPABASE_URL/SUPABASE_ANON_KEY are undefined here.
  //
  // These are inlined at BUILD time, not read at runtime: setting them on the
  // host after a build has already happened does nothing until a rebuild.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Checked explicitly rather than relying on `!` assertions, which satisfy
  // TypeScript while letting createBrowserClient throw an opaque
  // "supabaseUrl is required" deep inside the library.
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) throw new SupabaseConfigError(missing);

  return createBrowserClient<Database>(url!, anonKey!);
}
