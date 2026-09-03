import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";

// The cart's contents are per-visitor (client-side state), so there is no
// single canonical /cart page for Google to rank -- crawlable, never indexed.
export const metadata: Metadata = pageMetadata({
  title: "Cart | Gifta Guru",
  description: "Review corporate gifting quantities and continue to checkout.",
  path: "/cart",
  index: false,
});

export default async function CartPage() {
  // Checkout requires an account. Knowing this here lets the cart say so on
  // the button itself, rather than sending the shopper to /checkout only to
  // bounce them straight to /login.
  const user = isDatabaseConfigured() ? await getSessionUser() : null;
  return <CartPageClient signedIn={Boolean(user)} />;
}
