import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import StorefrontOnly from "@/components/layout/StorefrontOnly";
import FloatingCommunication from "@/components/lead/FloatingCommunication";
import { siteUrl } from "@/lib/env";
import { getStoreSettings } from "@/lib/data/store-settings";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Gifta Guru | Premium Corporate Gifting",
  description:
    "Gifta Guru is a premium corporate gifting platform for employee onboarding, appreciation, client gifting, and bulk corporate orders across India.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const storeSettings = await getStoreSettings();

  return (
    // data-scroll-behavior is required by Next when the html element sets
    // scroll-behavior: smooth, otherwise route transitions animate the scroll.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <CartProvider settings={storeSettings}>
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
