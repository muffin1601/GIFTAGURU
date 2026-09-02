import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import AddressBook from "@/components/account/AddressBook";
import AccountBreadcrumb from "@/components/account/AccountBreadcrumb";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Addresses | Gifta Guru",
  description: "Manage your saved delivery addresses.",
  path: "/account/addresses",
  index: false,
});

export default async function AddressesPage() {
  // The middleware already gates /account, but this page reads customer-owned
  // rows -- it must not depend on that alone.
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { profileId: user.id },
    // Default first, then most recently touched, matching the order checkout
    // presents them in.
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <Container className="py-12 sm:py-16">
      <AccountBreadcrumb current="Addresses" />
      <h1 className="type-h1 mt-4">Addresses</h1>
      <p className="type-lead mt-4 max-w-2xl">
        Save multiple delivery addresses and choose one at checkout. Your default is pre-selected.
      </p>

      <AddressBook addresses={addresses} />
    </Container>
  );
}
