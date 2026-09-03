import type { NextConfig } from "next";

// Admin-uploaded product images and customer logo uploads are served from
// Supabase storage's public URLs, which next/image refuses to optimize
// unless the host is explicitly allow-listed here.
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  // Stops the framework and its version being advertised on every response.
  poweredByHeader: false,

  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },

  /**
   * Baseline security headers.
   *
   * The application previously sent none, which on a site that takes card
   * payments left the checkout page framable (clickjacking), allowed MIME
   * sniffing of user-uploaded logos, and leaked full referrer URLs to third
   * parties.
   *
   * Note what is deliberately NOT here: a script-src Content-Security-Policy.
   * Razorpay Checkout injects its own scripts, styles and iframes at runtime,
   * so a CSP has to be written against their current asset hosts and
   * revalidated whenever those change -- shipping a guessed one would break
   * payments. `frame-ancestors` is safe to set now because it constrains who
   * may embed US, not what we may load. See the QA report's recommendations.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          {
            // Two years, preload-eligible. Only ever sent over HTTPS by the
            // host; harmless on local http.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
