import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Route } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { ncrServiceAreas, serviceAreaBySlug } from "@/lib/seo/locations";

export function generateStaticParams() {
  return ncrServiceAreas.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const area = serviceAreaBySlug((await params).slug);
  if (!area) return pageMetadata({ title: "Location not found | Gifta Guru", description: "This service area is not available.", path: "/locations", index: false });
  return pageMetadata({ title: `Corporate Diwali Gifts in ${area.name} | Gifta Guru`, description: `Corporate Diwali gifts, Diwali corporate gift kits and corporate gifting support for employee and client programmes in ${area.name}.`, path: `/locations/${area.slug}` });
}

export default async function ServiceAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const area = serviceAreaBySlug((await params).slug);
  if (!area) notFound();

  const sections = [
    { Icon: PackageCheck, title: "Choose the right recipient tier", copy: "Employee lists usually need a consistent, scalable kit, while client and leadership lists may benefit from a more considered premium tier." },
    { Icon: Route, title: `Plan delivery for ${area.name}`, copy: "Include every office split or recipient address in the enquiry so dispatch can be planned around the real list rather than a generic estimate." },
    { Icon: MapPin, title: "Coordinate one gifting programme", copy: "Keep products, branding and presentation consistent while accounting for the delivery requirements of each destination." },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }, { name: area.name, path: `/locations/${area.slug}` }])} />
      <PageHeader
        eyebrow="Diwali corporate gifting"
        title={`Corporate Diwali gifts in ${area.name}`}
        description={`Plan Diwali corporate gift kits for employees, clients and business partners in ${area.name}, with branding and delivery requirements included in one clear brief.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: area.name }]}
        actions={<Button href="/bulk-enquiry">Request a Diwali quote</Button>}
        image="/Diwali kits/Set 8/Primary_1.webp"
      />

      <section className="section bg-canvas">
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            {sections.map(({ Icon, title, copy }, index) => (
              <article key={title} className="hanna-card border border-line bg-surface p-7 sm:p-8">
                <div className="flex items-center justify-between"><Icon className="h-6 w-6 text-gold-600" strokeWidth={1.4} aria-hidden="true" /><span className="font-display text-2xl text-gold-600">0{index + 1}</span></div>
                <h2 className="mt-7 font-display text-2xl font-semibold text-navy-950">{title}</h2>
                <p className="type-body mt-3">{copy}</p>
              </article>
            ))}
          </div>

          <section className="hanna-card mt-14 grid gap-8 border border-line bg-surface p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="type-eyebrow">Continue planning</p><h2 className="type-h2 mt-3">Explore Diwali corporate gifts</h2><p className="type-body mt-4 max-w-2xl">Compare festive gift options, branded technology kits and practical planning advice before sharing your recipient list.</p></div>
            <ul className="space-y-3 lg:min-w-80">
              {[["Corporate Diwali gifts and hampers", "/diwali-2026"], ["Branded technology gifts", "/categories/tech-electronics"], ["Corporate tech gifting guide", "/blog/tech-corporate-gifting-kits"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="group flex items-center justify-between gap-4 border-b border-line py-3 text-sm font-semibold text-navy-950"><span>{label}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link></li>
              ))}
            </ul>
          </section>
        </Container>
      </section>
    </>
  );
}
