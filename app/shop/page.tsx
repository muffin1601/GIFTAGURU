import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import { countProducts, searchProducts } from "@/lib/data/products";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Shop Corporate Gifts | Gifta Guru",
  description: "Browse premium corporate gifts, joining kits, eco-friendly hampers, and bulk gifting solutions.",
  path: "/shop",
});

const PAGE_SIZE = 24;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  // The listing used to take a flat `limit: 24` with no offset and no page
  // controls, so the 25th product added to the catalogue would simply have
  // been unreachable from the storefront.
  const requestedPage = Number.parseInt(page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [products, total] = await Promise.all([
    searchProducts({ limit: PAGE_SIZE, offset: (currentPage - 1) * PAGE_SIZE }),
    countProducts({}),
  ]);

  const totalPages = total === null ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Corporate Gifts Ready for Teams, Clients, and Events"
        description="Browse curated gifting sets with bulk order quantities, customization options, and quote-ready pricing."
      />
      <Container className="py-12">
        {/* Names the grid for assistive tech and, because ProductCard titles
            are h3, keeps the document from skipping h1 -> h3. */}
        <h2 className="sr-only">Products</h2>

        {products.length === 0 ? (
          <div className="panel p-10 text-center">
            <h3 className="type-h3">Nothing to show here</h3>
            <p className="type-body mx-auto mt-3 max-w-md">
              {currentPage > 1
                ? "That page is past the end of the catalogue."
                : "Our catalogue is being updated. Please check back shortly."}
            </p>
            {currentPage > 1 ? (
              <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
                Back to first page
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Product listing pages"
            className="mt-12 flex items-center justify-center gap-4 border-t border-line pt-8"
          >
            {hasPrevious ? (
              <Link href={`/shop?page=${currentPage - 1}`} rel="prev" className="btn btn-secondary">
                Previous
              </Link>
            ) : (
              <span aria-disabled="true" className="btn btn-secondary opacity-40">
                Previous
              </span>
            )}

            <p aria-live="polite" className="type-meta">
              Page {currentPage} of {totalPages}
            </p>

            {hasNext ? (
              <Link href={`/shop?page=${currentPage + 1}`} rel="next" className="btn btn-secondary">
                Next
              </Link>
            ) : (
              <span aria-disabled="true" className="btn btn-secondary opacity-40">
                Next
              </span>
            )}
          </nav>
        ) : null}
      </Container>
    </>
  );
}
