import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import { countProducts, searchProducts } from "@/lib/data/products";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

function parsePage(value: string | undefined): number | null {
  if (value === undefined) return 1;
  if (!/^\d+$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const currentPage = parsePage((await searchParams).page);
  if (currentPage === null) {
    return pageMetadata({
      title: "Shop Corporate Gifts | Gifta Guru",
      description: "Browse premium corporate gifts, joining kits, eco-friendly hampers, and bulk gifting solutions.",
      path: "/shop",
      index: false,
    });
  }

  return pageMetadata({
    title: currentPage === 1 ? "Shop Corporate Gifts | Gifta Guru" : `Shop Corporate Gifts - Page ${currentPage} | Gifta Guru`,
    description: "Browse premium corporate gifts, joining kits, eco-friendly hampers, and bulk gifting solutions.",
    path: currentPage === 1 ? "/shop" : `/shop?page=${currentPage}`,
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  // The listing used to take a flat `limit: 24` with no offset and no page
  // controls, so the 25th product added to the catalogue would simply have
  // been unreachable from the storefront.
  const currentPage = parsePage(page);
  if (currentPage === null) notFound();

  const [products, total] = await Promise.all([
    searchProducts({ limit: PAGE_SIZE, offset: (currentPage - 1) * PAGE_SIZE }),
    countProducts({}),
  ]);

  const totalPages = total === null ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) notFound();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Corporate Gifts Ready for Teams, Clients, and Events"
        description="Browse curated gifting sets with bulk order quantities, customization options, and quote-ready pricing."
      />
      <Container className="py-14 sm:py-20">
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
          <div className="catalogue-grid grid sm:grid-cols-2 lg:grid-cols-4">
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
      <BusinessBuyerGuide
        title="Choosing gifts for a business programme"
        paragraphs={[
          "Use the catalogue to shortlist sets, then match the choice to the programme: onboarding, employee appreciation, client relationships, leadership gifting or corporate events. Product pages show current unit and volume pricing, while a quote can cover a mixed or branded requirement.",
          "For larger lists, an enquiry is often the quickest route to a relevant recommendation because quantity, personalisation and delivery requirements influence the right selection.",
        ]}
        links={[{ label: "Corporate gifting solutions", href: "/corporate-gifting" }, { label: "Employee welcome kits", href: "/gifting/employee-onboarding" }, { label: "Request a bulk quote", href: "/bulk-enquiry" }]}
      />
    </>
  );
}
