import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts } from "@/lib/data/products";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  // Every ?q= value is a distinct URL with the same template around it --
  // classic duplicate-content territory, and results aren't unique/valuable
  // enough to justify indexing each query. Crawlable (so links still work
  // and pass PageRank to the products listed), never indexed.
  return pageMetadata({
    title: "Search Gifts | Gifta Guru",
    description: "Search corporate gifting products by name, collection, category, and keyword.",
    path: params.q ? `/search?q=${encodeURIComponent(params.q)}` : "/search",
    index: false,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const products = await searchProducts({
    query: params.q,
    categorySlug: params.category,
    limit: 24,
  });

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Search</p>
        <h1 className="mt-3 font-display text-4xl text-navy-950 sm:text-5xl">Find the right corporate gift</h1>
      </div>
      <form action="/search" className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-navy-950/10 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search products, categories, keywords..."
          className="min-h-12 flex-1 rounded-full bg-cream-100 px-5 text-sm outline-none focus:ring-2 focus:ring-navy-900"
        />
        <button className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="mt-10">
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-navy-950/5">
            <h2 className="font-display text-2xl text-navy-950">No matching gifts found</h2>
            <p className="mt-2 text-ink-700">Try a broader keyword or request a custom gift box.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
