import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import type { LandingFamily, LandingPageContent, LandingSection } from "@/lib/seo/content/types";
import { landingFamilies } from "@/lib/seo/content/types";

/**
 * Hub page for a landing-page family. Its job is crawl depth: every editorial
 * page sits one click from a hub, and every hub sits one click from the footer,
 * so none of them are orphaned.
 *
 * `extraSections` is where a hub carries the coverage that did NOT earn its own
 * page -- the industries served without a dedicated landing page, for instance.
 * That keeps the long tail addressed in real content instead of in a set of
 * near-identical doorway pages.
 */
export default function LandingHubView({
  family,
  title,
  intro,
  pages,
  extraSections = [],
  visualGallery = [],
}: {
  family: LandingFamily;
  title: string;
  intro: string[];
  pages: LandingPageContent[];
  extraSections?: LandingSection[];
  /** Existing catalogue imagery for a hub. Images are editorial only; product
   * details and pricing continue to live on the linked product pages. */
  visualGallery?: { src: string; alt: string }[];
}) {
  const config = landingFamilies[family];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: config.label, path: config.basePath },
        ])}
      />

      <section className="border-b border-line">
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-950">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-navy-950">{config.label}</span>
          </nav>
        </Container>
        <Container className="pb-14 pt-6 sm:pb-16">
          <div className="max-w-3xl">
            <span className="type-eyebrow">{config.label}</span>
            <h1 className="type-h1 mt-4">{title}</h1>
            {intro.map((paragraph) => (
              <p key={paragraph} className="type-lead mt-5">{paragraph}</p>
            ))}
            <Button href="/bulk-enquiry" variant="primary" className="mt-8">
              Request a Custom Quote
            </Button>
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-16">
        {visualGallery.length > 0 ? (
          <section className="border-b border-line pb-14 sm:pb-16">
            <div className="max-w-3xl">
              <span className="type-eyebrow">2026 catalogue</span>
              <h2 className="type-h2 mt-3">Featured Diwali Gift Kits</h2>
              <p className="type-body mt-4">
                A selection of coordinated corporate gift kits from the Diwali catalogue.
                Enquire with your recipient count to discuss the right set for your list.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visualGallery.map((image) => (
                <figure key={image.src} className="overflow-hidden border border-line bg-surface">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <li key={page.slug} className="border-t border-line pt-6">
              <h2 className="font-display text-xl text-navy-950">
                <Link href={`${config.basePath}/${page.slug}`} className="hover:text-gold-600">
                  {page.h1}
                </Link>
              </h2>
              <p className="type-body mt-3">{page.intro[0]}</p>
              <Link
                href={`${config.basePath}/${page.slug}`}
                className="link-underline type-meta mt-4 inline-block text-navy-950"
              >
                {page.primaryKeyword}
              </Link>
            </li>
          ))}
        </ul>

        {extraSections.length > 0 ? (
          <div className="mt-16 max-w-3xl space-y-10 border-t border-line pt-10">
            {extraSections.map((section) => (
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
        ) : null}
      </Container>
    </>
  );
}
