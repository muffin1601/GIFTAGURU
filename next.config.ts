import type { NextConfig } from "next";

// Admin-uploaded product images and customer logo uploads are served from
// Supabase storage's public URLs, which next/image refuses to optimize
// unless the host is explicitly allow-listed here.
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
