import type { Metadata } from "next";
import CheckoutClient from "@/components/cart/CheckoutClient";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Checkout | Gifta Guru",
  description: "Secure corporate checkout for your Gifta Guru order.",
  path: "/checkout",
  index: false,
});

export default async function CheckoutPage() {
  // Guest checkout is still supported, so this resolves to null rather than
  // redirecting. Saved addresses (and therefore split delivery) simply need an
  // account, which the UI explains rather than enforcing up front.
  const user = isDatabaseConfigured() ? await getSessionUser() : null;

  const addresses = user
    ? await prisma.address.findMany({
        where: { profileId: user.id },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      })
    : [];

  return (
    <CheckoutClient
      signedIn={Boolean(user)}
      savedAddresses={addresses.map((address) => ({
        id: address.id,
        label: address.label ?? "other",
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      }))}
    />
  );
}
