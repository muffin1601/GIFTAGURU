import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts } from "@/lib/data/products";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Shop Corporate Gifts | Gifta Guru",
  description: "Browse premium corporate gifts, joining kits, eco-friendly hampers, and bulk gifting solutions.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await searchProducts({ limit: 24 });

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Corporate Gifts Ready for Teams, Clients, and Events"
        description="Browse curated gifting sets with bulk order quantities, customization options, and quote-ready pricing."
      />
      <Container className="py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </>
  );
}
