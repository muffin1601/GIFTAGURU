import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Route } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { ncrServiceAreas } from "@/lib/seo/locations";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Locations | Gifta Guru",
  description: "Gifta Guru supports corporate gifting programmes across India, with its New Delhi office available for business enquiries.",
  path: "/locations",
});

const coverage = [
  { Icon: Route, title: "Pan-India delivery", copy: "Plan one-office or multi-location dispatch for distributed teams and recipient lists." },
  { Icon: Building2, title: "New Delhi office", copy: "Discuss branded gifts, employee kits, client gifting and bulk requirements with our team." },
  { Icon: MapPin, title: "NCR service planning", copy: "Prepare location-aware Diwali and corporate gifting programmes across the NCR." },
];

export default function LocationsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }])} />
      <PageHeader
        eyebrow="Locations & delivery"
        title="Corporate gifting support across India"
        description="Plan branded gifts, bulk programmes and multi-location dispatch with one gifting partner. Our listed business office is in New Delhi."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Locations" }]}
        actions={<><Button href="/bulk-enquiry">Plan a multi-location order</Button><Button href="/contact" variant="secondary">Talk to our team</Button></>}
        image="/images/editorial/luxury-gift-packaging.webp"
      />

      <section className="section bg-canvas">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {coverage.map(({ Icon, title, copy }, index) => (
              <article key={title} className="hanna-card border border-line bg-surface p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-gold-600" strokeWidth={1.4} aria-hidden="true" />
                  <span className="font-display text-2xl text-gold-600">0{index + 1}</span>
                </div>
                <h2 className="mt-7 font-display text-2xl font-semibold text-navy-950">{title}</h2>
                <p className="type-body mt-3">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="lg:sticky lg:top-40">
              <p className="type-eyebrow">Our office</p>
              <h2 className="type-h2 mt-3">Start with our New Delhi team</h2>
              <p className="type-body mt-4">Get help with gift selection, branding, recipient tiers and nationwide delivery planning.</p>
              <Link href="/locations/new-delhi" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-950">
                View New Delhi details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
            <div className="hanna-card border border-line bg-navy-950 p-7 text-cream-100 sm:p-10">
              <p className="font-script text-lg text-gold-300">NCR delivery coverage</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Corporate Diwali gifting service areas</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-cream-100/70">These pages explain delivery planning for NCR recipient lists. They describe service coverage, not additional office locations.</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {ncrServiceAreas.map((area) => (
                  <li key={area.slug}>
                    <Link href={`/locations/${area.slug}`} className="group flex h-full items-center justify-between gap-4 border border-cream-100/15 bg-navy-900 px-5 py-4 text-sm font-medium transition-colors hover:border-gold-300/60">
                      <span>Corporate gifts in {area.name}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gold-300 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
