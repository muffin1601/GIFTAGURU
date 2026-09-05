import Link from "next/link";
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
}: {
  family: LandingFamily;
  title: string;
  intro: string[];
  pages: LandingPageContent[];
  extraSections?: LandingSection[];
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
