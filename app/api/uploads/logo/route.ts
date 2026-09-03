import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { LOGO_UPLOAD_ALLOWED_MIME_TYPES, LOGO_UPLOAD_MAX_BYTES } from "@/lib/config/store";
import { getSessionUser } from "@/lib/auth/session";
import { consume, tooManyRequests } from "@/lib/rate-limit";

const BUCKET = "customization-logos";

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "logo";
}

/**
 * Confirms the bytes really are a PNG or JPEG.
 *
 * `file.type` is supplied by the browser and trivially forged, so on its own it
 * let anything at all be written into a PUBLIC storage bucket under an
 * image content type. Checking the magic number means the stored object is
 * actually the format it is served as.
 */
async function hasImageMagicBytes(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (header.length < 3) return false;

  const isPng =
    header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;

  return isPng || isJpeg;
}

export async function POST(request: Request) {
  // This endpoint writes to public object storage. Leaving it open let anyone
  // fill the bucket with 5MB objects indefinitely, at the store's expense and
  // under the store's domain. It backs the checkout customization field, so
  // requiring a session costs a real customer nothing.
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Please sign in to upload your logo." },
      { status: 401 },
    );
  }

  const limit = consume(`upload-logo:${sessionUser.id}`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    return tooManyRequests("Too many logo uploads. Please try again later.", limit.retryAfter);
  }

  const formData = await request.formData();
  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
  }

  if (!LOGO_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Upload a PNG or JPG logo." }, { status: 400 });
  }

  if (file.size > LOGO_UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Logo must be 5MB or less." }, { status: 400 });
  }

  if (!(await hasImageMagicBytes(file))) {
    return NextResponse.json({ error: "That file is not a valid PNG or JPG image." }, { status: 400 });
  }

  const fileName = safeFileName(file.name);

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      url: `pending-logo://${randomUUID()}/${fileName}`,
      fileName,
      storage: "pending",
      message: "Logo validated. Configure Supabase service credentials to persist uploads.",
    });
  }

  const supabase = createAdminClient();
  const path = `logos/${randomUUID()}-${fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: data.publicUrl,
    fileName,
    storage: "supabase",
  });
}
