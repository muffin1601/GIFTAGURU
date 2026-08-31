import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { categories } from "@/data/categories";
import { getCollectionBySlug } from "@/lib/data/collections";
import { getProductsByCollection } from "@/lib/data/products";
import { pageMetadata, truncateDescription } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

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
  if (!category) {
    return pageMetadata({
      title: "Collection not found | Gifta Guru",
      description: "This collection is no longer available.",
      path: `/categories/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${category.name} | Gifta Guru`,
    description: truncateDescription(category.description || category.tagline || `${category.name} corporate gifts, curated by Gifta Guru.`),
    path: `/categories/${category.slug}`,
    image: category.image,
    imageAlt: category.name,
  });
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
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${category.slug}` },
        ])}
      />
      <section className="border-b border-line">
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-950">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/categories" className="hover:text-navy-950">Categories</Link>
            <span aria-hidden="true">/</span>
            <span className="text-navy-950">{category.name}</span>
          </nav>
        </Container>
        <Container className="grid items-center gap-10 pb-14 pt-6 sm:pb-16 lg:grid-cols-[1fr_auto] lg:gap-16">
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
