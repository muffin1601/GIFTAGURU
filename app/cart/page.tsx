import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { pageMetadata } from "@/lib/seo/metadata";

// The cart's contents are per-visitor (client-side state), so there is no
// single canonical /cart page for Google to rank -- crawlable, never indexed.
export const metadata: Metadata = pageMetadata({
  title: "Cart | Gifta Guru",
  description: "Review corporate gifting quantities and continue to checkout.",
  path: "/cart",
  index: false,
});

export default function CartPage() {
  return <CartPageClient />;
}
