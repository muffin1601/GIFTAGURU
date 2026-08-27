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
      <section className="relative">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            src={category.image}
            alt={category.tagline}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              {category.name}
            </span>
            <h1 className="font-display text-3xl text-navy-950 sm:text-4xl">{category.tagline}</h1>
            <p className="max-w-2xl text-base text-ink-700">{category.description}</p>
            <div>
              <Button href={`/bulk-enquiry?collection=${encodeURIComponent(category.name)}`} variant="primary" className="mt-2">
                Request a custom quote
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-navy-950/10 bg-white p-5">
            <p className="font-display text-2xl text-navy-950">Looking for gifts in bulk?</p>
            <p className="mt-2 text-sm text-ink-700">Tell us your quantity, budget, and branding needs for the {category.name} collection.</p>
            <Button href={`/bulk-enquiry?collection=${encodeURIComponent(category.name)}`} variant="secondary" className="mt-4">
              Request a custom quote
            </Button>
          </div>

          {products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
