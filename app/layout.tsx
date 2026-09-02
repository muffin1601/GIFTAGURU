import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
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
