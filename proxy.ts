import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Canonical URLs, the sitemap and structured data all use www. Redirect the
  // apex host before any application work so historic Shopify paths discovered
  // on giftaguru.com cannot split indexing signals from www.giftaguru.com.
  const requestedUrl = new URL(request.url);
  const canonicalUrl = new URL(siteUrl());
  if (requestedUrl.host.toLowerCase() !== canonicalUrl.host.toLowerCase()) {
    requestedUrl.protocol = canonicalUrl.protocol;
    requestedUrl.host = canonicalUrl.host;
    return NextResponse.redirect(requestedUrl, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
