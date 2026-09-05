import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { getProductsBySlugs } from "@/lib/data/products";
import { breadcrumbSchema, faqPageSchema } from "@/lib/seo/schema";
import type { LandingFamily, LandingPageContent } from "@/lib/seo/content/types";
import { landingFamilies } from "@/lib/seo/content/types";

/**
 * The single renderer behind every editorial SEO landing page (industry,
 * use-case, occasion, multi-piece gift set, guide).
 *
 * Structure is fixed so every page ships exactly one H1, a real breadcrumb,
 * FAQ markup that matches visible content, and outbound internal links --
 * none of which can be forgotten on a new page. The words are entirely
 * per-page; only the scaffolding is shared.
 *
 * FAQPage JSON-LD is emitted only from `content.faqs`, which is the same array
 * rendered visibly below, so the structured data can never describe content a
 * visitor cannot see.
 */
export default async function LandingPageView({
  family,
  content,
}: {
  family: LandingFamily;
  content: LandingPageContent;
}) {
  const config = landingFamilies[family];
  const path = `${config.basePath}/${content.slug}`;
  const products = await getProductsBySlugs(content.recommendedProductSlugs);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: config.label, path: config.basePath },
            { name: content.h1, path },
          ]),
          faqPageSchema(content.faqs),
        ]}
      />

      <section className="border-b border-line">
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-950">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={config.basePath} className="hover:text-navy-950">{config.label}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-navy-950">{content.h1}</span>
          </nav>
        </Container>
        <Container className="pb-14 pt-6 sm:pb-16">
          <div className="max-w-3xl">
            <span className="type-eyebrow">{config.label}</span>
            <h1 className="type-h1 mt-4">{content.h1}</h1>
            {content.intro.map((paragraph) => (
              <p key={paragraph} className="type-lead mt-5">{paragraph}</p>
            ))}
            <Button href="/bulk-enquiry" variant="primary" className="mt-8">
              Request a Custom Quote
            </Button>
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-16">
        <div className="max-w-3xl space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="type-h2">{section.heading}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="type-body mt-4">{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="type-body flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {products.length > 0 ? (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="type-h2">Recommended gift sets</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Frequently asked questions</h2>
          <dl className="mt-8 max-w-3xl space-y-8">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-display text-lg text-navy-950">{faq.question}</dt>
                <dd className="type-body mt-2">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Continue exploring</h2>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {content.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-underline text-navy-950">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
