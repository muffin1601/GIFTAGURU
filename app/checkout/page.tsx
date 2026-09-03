import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  // Checkout requires an account: nobody proceeds to payment signed out.
  // Bounced to sign-in with `?next=/checkout` so they land straight back here,
  // and `loginAction` merges the guest cart into the account before
  // redirecting -- so signing in at this point never costs them their basket.
  //
  // This redirect is for the customer's benefit, not for security. The real
  // enforcement is the 401 in /api/razorpay/create-order, which is what a
  // crafted request actually hits.
  const user = isDatabaseConfigured() ? await getSessionUser() : null;
  if (!user) redirect("/login?next=/checkout");

  const addresses = await prisma.address.findMany({
    where: { profileId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  // `signedIn` is always true past the gate above; passed explicitly so
  // DeliverySplit's signed-in branch stays readable at the call site.
  return (
    <CheckoutClient
      signedIn
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
