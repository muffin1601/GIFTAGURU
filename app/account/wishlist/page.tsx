import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import AccountBreadcrumb from "@/components/account/AccountBreadcrumb";
import WishlistGrid, { type WishlistEntry } from "@/components/account/WishlistGrid";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Wishlist | Gifta Guru",
  description: "Products you've saved for later.",
  path: "/account/wishlist",
  index: false,
});

export default async function WishlistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/wishlist");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              priceTiers: true,
              variants: {
                orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
                take: 1,
                include: { inventory: true },
              },
            },
          },
        },
      },
    },
  });

  const entries: WishlistEntry[] = (wishlist?.items ?? [])
    // An archived product stays in the table but must not be offered for sale.
    .filter((item) => item.product.status === "active")
    .map((item) => {
      const product = item.product;
      const variant = product.variants[0];
      const available = variant?.inventory
        ? Math.max(variant.inventory.quantityAvailable - variant.inventory.quantityReserved, 0)
        : 0;

      return {
        available,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: "",
          description: product.description ?? "",
          price: Number(product.basePrice),
          minQuantity: product.minOrderQuantity,
          featured: product.isFeatured,
          image: product.images[0]?.url,
          inStock: available > 0,
          priceTiers: product.priceTiers.map((tier) => ({
            minQuantity: tier.minQuantity,
            unitPrice: Number(tier.unitPrice),
          })),
        },
      };
    });

  return (
    <Container className="py-12 sm:py-16">
      <AccountBreadcrumb current="Wishlist" />
      <h1 className="type-h1 mt-4">Wishlist</h1>
      <p className="type-lead mt-4 max-w-2xl">Gifts you&apos;ve saved. Add them to your cart whenever you&apos;re ready.</p>

      <WishlistGrid entries={entries} />
    </Container>
  );
}
