import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { categories } from "@/data/categories";
import { getCollectionBySlug } from "@/lib/data/collections";
import { getProductsByCollection } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCollectionBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} | Gifta Guru`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCollectionBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCollection(category.slug);

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="max-w-2xl">
            <span className="type-eyebrow">{category.name}</span>
            <h1 className="type-h1 mt-4">{category.tagline}</h1>
            <p className="type-lead mt-5">{category.description}</p>
            <Button
              href={`/bulk-enquiry?collection=${encodeURIComponent(category.name)}`}
              variant="primary"
              className="mt-8"
            >
              Request a Custom Quote
            </Button>
          </div>

          {/* A small accent image rather than a full-bleed banner -- the
              product grid below is the real content on this page. */}
          <div className="relative hidden aspect-square w-40 shrink-0 overflow-hidden border border-line bg-sunken lg:block xl:w-48">
            <Image
              src={category.image}
              alt=""
              fill
              sizes="192px"
              className="object-cover"
              priority
            />
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          {products.length > 0 ? (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="type-body">No products in this collection yet.</p>
          )}
        </Container>
      </section>
    </>
  );
}
