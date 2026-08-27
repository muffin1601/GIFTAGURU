import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { LOGO_UPLOAD_ALLOWED_MIME_TYPES, LOGO_UPLOAD_MAX_BYTES } from "@/lib/config/store";

const BUCKET = "customization-logos";

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "logo";
}

export async function POST(request: Request) {
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
