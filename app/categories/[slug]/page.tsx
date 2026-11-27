import type { Metadata } from "next";
import CollectionHero from "@/components/content/CollectionHero";
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
import { breadcrumbSchema, faqPageSchema, itemListSchema } from "@/lib/seo/schema";
import { getCollectionSeoContent } from "@/lib/seo/content/collections";

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

  const products = await getProductsByCollection(category.slug);

  // Cluster-head-term metadata for the four core collections; admin-created
  // collections fall back to their own description.
  const seo = getCollectionSeoContent(slug);

  return pageMetadata({
    title: `${seo?.seoTitle ?? category.name} | Gifta Guru`,
    description:
      seo?.metaDescription ??
      truncateDescription(category.description || category.tagline || `${category.name} corporate gifts, curated by Gifta Guru.`),
    path: `/categories/${category.slug}`,
    image: category.image,
    imageAlt: category.name,
    index: products.length > 0,
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
  const seo = getCollectionSeoContent(category.slug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          // Describes the grid actually rendered below, in the same order.
          itemListSchema(products.map((p) => ({ name: p.name, slug: p.slug }))),
          faqPageSchema(seo?.faqs ?? []),
        ]}
      />
      <CollectionHero
        category={{ slug: category.slug, name: category.name, imageUrl: category.image }}
        title={seo?.h1 || category.tagline || category.name}
        actions={
          <>
            <Button href={`/bulk-enquiry?collection=${encodeURIComponent(category.name)}`} variant="primary">
              Request a Custom Quote
            </Button>
            <Link href="#products" className="link-underline text-sm font-semibold">
              Browse the collection
            </Link>
          </>
        }
      />
      <section className="border-b border-line bg-sunken">
        <Container className="py-10 sm:py-12">
          <div className="max-w-3xl">
            {seo ? (
              seo.intro.map((paragraph) => (
                <p key={paragraph} className="type-lead mt-4 first:mt-0">{paragraph}</p>
              ))
            ) : (
              <p className="type-lead">{category.description}</p>
            )}
          </div>
        </Container>
      </section>

      <section id="products" className="section">
        <Container>
          {products.length > 0 ? (
            <div className="catalogue-grid grid sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="type-body">No products in this collection yet.</p>
          )}

          {seo ? (
            <>
              <section className="editorial-panel mt-16">
                <h2 className="type-h2">How to choose from this collection</h2>
                <ul className="mt-6 max-w-3xl space-y-2">
                  {seo.buyingPoints.map((point) => (
                    <li key={point} className="type-body flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="editorial-panel mt-8">
                <h2 className="type-h2">Frequently asked questions</h2>
                <dl className="mt-8 max-w-3xl space-y-8">
                  {seo.faqs.map((faq) => (
                    <div key={faq.question}>
                      <dt className="font-display text-lg text-navy-950">{faq.question}</dt>
                      <dd className="type-body mt-2">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="editorial-panel mt-8">
                <h2 className="type-h2">Continue exploring</h2>
                <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                  {seo.relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="link-underline text-navy-950">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </Container>
      </section>
    </>
  );
}
