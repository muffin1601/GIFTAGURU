import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
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
    <>
      <PageHeader
        eyebrow="Search the catalogue"
        title="Find the right corporate gift"
        description="Search by product, collection, recipient or gifting occasion, then compare the options that match your brief."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        image="/images/editorial/premium-corporate-gifting.webp"
      />
      <section className="section bg-canvas">
        <Container>
          <form action="/search" className="page-card mx-auto flex max-w-4xl flex-col gap-3 p-3 sm:flex-row sm:p-4">
            <label htmlFor="catalogue-search" className="sr-only">Search products, categories and keywords</label>
            <input id="catalogue-search" type="search" name="q" defaultValue={params.q} placeholder="Search products, categories, keywords..." className="min-h-12 flex-1 rounded-full bg-cream-100 px-5 text-sm outline-none" />
            <button className="btn btn-primary">Search catalogue</button>
          </form>

          <div className="mt-12">
            {products.length > 0 ? (
              <><div className="flex items-end justify-between gap-6 border-b border-line pb-6"><div><p className="type-eyebrow">Search results</p><h2 className="type-h2 mt-2">{params.q ? `Gifts matching “${params.q}”` : "Explore corporate gifts"}</h2></div><p className="type-meta">{products.length} result{products.length === 1 ? "" : "s"}</p></div><div className="catalogue-grid mt-8 grid sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></>
            ) : (
              <div className="page-card mx-auto max-w-3xl p-10 text-center sm:p-14"><p className="font-script text-lg text-gold-700">No exact match</p><h2 className="type-h2 mt-3">Let us help build the right gift box</h2><p className="type-body mx-auto mt-4 max-w-xl">Try a broader keyword, browse the complete catalogue, or share your recipient and budget requirements for a curated recommendation.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button href="/shop">Browse all gifts</Button><Button href="/bulk-enquiry" variant="secondary">Request a quote</Button></div></div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
