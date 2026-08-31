import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // Only NEXT_PUBLIC_-prefixed vars are inlined into the browser bundle;
  // the server-only SUPABASE_URL/SUPABASE_ANON_KEY are undefined here.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
