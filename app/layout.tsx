import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import StorefrontOnly from "@/components/layout/StorefrontOnly";
import FloatingCommunication from "@/components/lead/FloatingCommunication";
import { siteUrl } from "@/lib/env";
import { getStoreSettings } from "@/lib/data/store-settings";
import { getCartView } from "@/lib/cart/service";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, logoUrl } from "@/lib/seo/site";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";
import AuthHashErrorWatcher from "@/components/auth/AuthHashErrorWatcher";
import "./globals.css";

// Fonts are self-hosted from the @fontsource-variable packages rather than
// loaded with next/font/google. next/font/google downloads the files from
// Google at build time, and a failed download fails the whole Vercel build
// ("Can't resolve '@vercel/turbopack-next/internal/font/google/font'").
// Each file is a Latin variable font covering every weight the site uses.
const bodoniModa = localFont({
  variable: "--font-bodoni-moda",
  src: "../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-wght-normal.woff2",
  weight: "400 900",
  display: "swap",
});

const inter = localFont({
  variable: "--font-inter",
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
});

const dancingScript = localFont({
  variable: "--font-dancing-script",
  src: "../node_modules/@fontsource-variable/dancing-script/files/dancing-script-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
});

// Deliberately NOT using Next's title `template` option: every page in this
// app (via lib/seo/metadata's pageMetadata(), and the handful of pages that
// still set metadata directly) already writes its own full "X | Gifta Guru"
// title, so a template would double-suffix every single page.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${SITE_NAME} | Premium Corporate Gifting`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: siteUrl() },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${SITE_NAME} | Premium Corporate Gifting`,
    description: SITE_DESCRIPTION,
    url: siteUrl(),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [{ url: logoUrl(), alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Premium Corporate Gifting`,
    description: SITE_DESCRIPTION,
    images: [logoUrl()],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Both read server-side so the first paint carries the real cart -- the
  // header badge and cart page no longer flash empty while a client store
  // rehydrates from localStorage.
  const [storeSettings, initialCart] = await Promise.all([getStoreSettings(), getCartView()]);

  return (
    // data-scroll-behavior is required by Next when the html element sets
    // scroll-behavior: smooth, otherwise route transitions animate the scroll.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bodoniModa.variable} ${inter.variable} ${dancingScript.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9BK35BLWT8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9BK35BLWT8');`}
        </Script>
        {/* Supabase drops failed auth links on an arbitrary page with the
            reason in a hash fragment; this catches it wherever it lands. */}
        <AuthHashErrorWatcher />
        <CartProvider settings={storeSettings} initialCart={initialCart}>
          <StorefrontOnly>
            <Header />
          </StorefrontOnly>
          <main className="flex-1">{children}</main>
          <StorefrontOnly>
            <Footer />
            <FloatingCommunication />
          </StorefrontOnly>
        </CartProvider>
      </body>
    </html>
  );
}
