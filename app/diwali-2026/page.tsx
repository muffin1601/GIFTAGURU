import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import JsonLd from "@/components/seo/JsonLd";
import { getProductsBySlugs } from "@/lib/data/products";
import { siteUrl } from "@/lib/env";
import { organizationId, websiteId } from "@/lib/seo/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqPageSchema, itemListSchema } from "@/lib/seo/schema";
import { expandProductSlugs } from "@/lib/seo/content/products";
import { diwali2026 as content } from "@/lib/seo/content/seasonal";

/**
 * The Diwali 2026 seasonal hub.
 *
 * A bespoke route rather than another entry under /occasions, for two reasons:
 * the occasion pages are contractually evergreen and must never name a year
 * (see the header comment in lib/seo/content/occasions.ts), and this page needs
 * a structure -- hero, recipient grid, gifting tiers -- that the shared
 * LandingPageView deliberately does not offer.
 *
 * It is a Server Component end to end. The only client boundary on the page is
 * ProductCard, which owns the add-to-cart button; nothing else here ships JS.
 *
 * Every internal link below points at a route that already exists, and every
 * product card is resolved against the live catalog -- a deleted product drops
 * out of the grid instead of leaving a broken link.
 */

const PATH = "/diwali-2026";

export const metadata: Metadata = pageMetadata({
  title: `${content.seoTitle} | Gifta Guru`,
  description: content.metaDescription,
  path: PATH,
  image: content.heroImage.src,
  imageAlt: content.heroImage.alt,
});

export default async function Diwali2026Page() {
  // Expanded so a product stored under an aliased slug in the database still
  // resolves; without this the card is silently missing from the grid.
  const products = await getProductsBySlugs(expandProductSlugs(content.recommendedProductSlugs));

  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "WebPage",
            name: content.h1,
            description: content.metaDescription,
            // Absolute, like every other URL this app emits in JSON-LD -- a
            // hand-built object gets none of Next's metadataBase resolution.
            url: `${siteUrl()}${PATH}`,
            inLanguage: "en-IN",
            isPartOf: { "@id": websiteId() },
            publisher: { "@id": organizationId() },
          },
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Diwali 2026", path: PATH },
          ]),
          faqPageSchema(content.faqs),
          // Describes the product cards actually rendered below, in order.
          itemListSchema(products.map((product) => ({ name: product.name, slug: product.slug }))),
        ]}
      />

      {/* ---------------------------------------------------------------- *
       * Hero. The image sits in a fixed-ratio box on both breakpoints so it
       * reserves its space before loading -- the copy never reflows.
       * ---------------------------------------------------------------- */}
      <section className="border-b border-line">
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-950">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-navy-950">Diwali 2026</span>
          </nav>
        </Container>

        <Container className="grid items-center gap-10 pb-14 pt-8 sm:pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="max-w-2xl">
            <span className="type-eyebrow">{content.heroEyebrow}</span>
            <h1 className="type-h1 mt-4">{content.h1}</h1>
            <p className="type-lead mt-5">{content.heroLead}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={content.primaryCta.href} variant="primary">
                {content.primaryCta.label}
              </Button>
              <Button href={content.secondaryCta.href} variant="secondary">
                {content.secondaryCta.label}
              </Button>
            </div>

            <p className="type-meta mt-5">
              Company list?{" "}
              <Link href="/bulk-orders" className="link-underline text-navy-950">
                Bulk Diwali orders
              </Link>{" "}
              are quoted on quantity and personalisation.
            </p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-surface lg:aspect-[5/4]">
            <Image
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              fill
              // The LCP element on this page: eager, high priority, no lazy.
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-16">
        {/* Intro + the editorial H2 sections. */}
        <div className="max-w-3xl">
          {content.intro.map((paragraph) => (
            <p key={paragraph} className="type-lead mt-5 first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 max-w-3xl space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="type-h2">{section.heading}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="type-body mt-4">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="type-body flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {/* Mid-page conversion break, placed after the corporate and premium
            copy where commercial intent is highest. */}
        <section className="mt-16 border border-line bg-cream-200 px-6 py-10 sm:px-10">
          <div className="max-w-2xl">
            <h2 className="type-h2">Planning a company-wide Diwali list?</h2>
            <p className="type-body mt-4">
              Share your quantities, personalisation requirement and how deliveries need to split.
              The team will come back with options across tiers rather than a single fixed figure.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/bulk-enquiry" variant="primary">
                Enquire for Bulk Orders
              </Button>
              <Button href="/contact" variant="secondary">
                Talk to Our Gifting Team
              </Button>
            </div>
          </div>
        </section>

        {/* Recipient grid. */}
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Diwali Gifting Ideas for Different Recipients</h2>
          <p className="type-body mt-4 max-w-3xl">
            The quickest way to shortlist is by who is receiving the gift. Each of these leads to the
            part of the range built for that relationship.
          </p>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {content.recipients.map((recipient) => (
              <article key={recipient.title} className="flex flex-col">
                <h3 className="font-display text-[1.0625rem] leading-snug text-navy-950">
                  {recipient.title}
                </h3>
                <p className="type-body mt-2 flex-1">{recipient.body}</p>
                <Link
                  href={recipient.link.href}
                  className="link-underline mt-4 self-start text-sm text-navy-950"
                >
                  {recipient.link.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Gifting tiers. Described by intent and scale, never by price -- the
            catalog owns pricing and this copy must not restate it. */}
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Diwali Gift Ideas by Gifting Tier</h2>
          <p className="type-body mt-4 max-w-3xl">
            Most Diwali lists run two tiers at once - a considered gift for everyone, and a higher
            tier for a shorter list. Current pricing sits on the product pages themselves.
          </p>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {content.tiers.map((tier) => (
              <article key={tier.title} className="border border-line bg-surface p-6">
                <h3 className="font-display text-[1.0625rem] leading-snug text-navy-950">
                  {tier.title}
                </h3>
                <p className="type-body mt-2">{tier.body}</p>
                <Link
                  href={tier.link.href}
                  className="link-underline mt-4 inline-block text-sm text-navy-950"
                >
                  {tier.link.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {products.length > 0 ? (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="type-h2">Diwali Gift Sets to Consider</h2>
            <p className="type-body mt-4 max-w-3xl">
              Sets from the current range whose finish and presentation suit the festive quarter.
            </p>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Link href="/shop" className="link-underline mt-10 inline-block text-navy-950">
              Browse the full gift range
            </Link>
          </section>
        ) : null}

        {/* FAQs. Rendered visibly here and marked up above from the same array,
            so the FAQPage structured data can never describe hidden content. */}
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Diwali 2026 FAQs</h2>
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
