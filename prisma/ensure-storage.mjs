import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

/**
 * Creates the public storage buckets the app uploads into, if they don't
 * already exist. Supabase storage buckets have no SQL migration path, so
 * this script is the repeatable equivalent -- safe to re-run.
 *
 * Discovered while building admin product-image management: neither bucket
 * existed in this project, so every upload (including the pre-existing
 * customer logo upload on the product page) was failing with "Bucket not
 * found" and silently falling back to a non-persisted placeholder.
 */
const BUCKETS = [
  { id: "customization-logos", public: true, fileSizeLimit: "5MB" },
  { id: "product-images", public: true, fileSizeLimit: "8MB" },
];

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listError } = await supabase.storage.listBuckets();
if (listError) throw listError;
const existingIds = new Set(existing.map((bucket) => bucket.id));

for (const bucket of BUCKETS) {
  if (existingIds.has(bucket.id)) {
    console.log(`exists   ${bucket.id}`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(bucket.id, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
  });
  if (error) throw error;
  console.log(`created  ${bucket.id}`);
}
