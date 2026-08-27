import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart | Gifta Guru",
  description: "Review corporate gifting quantities and continue to checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
