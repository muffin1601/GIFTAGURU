import type { Metadata } from "next";
import CheckoutClient from "@/components/cart/CheckoutClient";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Checkout | Gifta Guru",
  description: "Secure corporate checkout for your Gifta Guru order.",
  path: "/checkout",
  index: false,
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
