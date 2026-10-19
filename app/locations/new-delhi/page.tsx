import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { STORE_CONTACT } from "@/lib/config/store";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting in New Delhi | Gifta Guru",
  description: "Plan branded corporate gifts, employee welcome kits, client gifts and bulk gifting with Gifta Guru's New Delhi office.",
  path: "/locations/new-delhi",
});

const usefulLinks = [
  ["Corporate gifting solutions", "/corporate-gifting"],
  ["Employee onboarding gifts", "/gifting/employee-onboarding"],
  ["Corporate gifts for clients", "/gifting/client-appreciation"],
  ["Bulk and multi-location orders", "/bulk-enquiry"],
];

export default function NewDelhiLocationPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }, { name: "New Delhi", path: "/locations/new-delhi" }])} />
      <PageHeader
        eyebrow="New Delhi office"
        title="Corporate gifting in New Delhi"
        description="Plan branded gifts, employee welcome kits, client gifting and bulk orders with our New Delhi team, including delivery requirements for programmes across India."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: "New Delhi" }]}
        actions={<Button href="/bulk-enquiry">Request a custom quote</Button>}
        image="/images/editorial/premium-corporate-gifting.webp"
      />

      <section className="section bg-canvas">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hanna-card bg-navy-950 p-7 text-cream-100 sm:p-10">
            <p className="font-script text-lg text-gold-300">Talk to our team</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Office and contact details</h2>
            <address className="mt-8 space-y-5 not-italic text-sm leading-6 text-cream-100/75">
              <p className="flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-300" strokeWidth={1.5} aria-hidden="true" /><span>{STORE_CONTACT.address}</span></p>
              <p><a href={`tel:${STORE_CONTACT.phoneHref}`} className="flex items-center gap-3 hover:text-gold-300"><Phone className="h-5 w-5 text-gold-300" strokeWidth={1.5} aria-hidden="true" />{STORE_CONTACT.phone}</a></p>
              <p><a href={`mailto:${STORE_CONTACT.email}`} className="flex items-center gap-3 hover:text-gold-300"><Mail className="h-5 w-5 text-gold-300" strokeWidth={1.5} aria-hidden="true" />{STORE_CONTACT.email}</a></p>
            </address>
          </aside>

          <div className="hanna-card border border-line bg-surface p-7 sm:p-10">
            <p className="type-eyebrow">Plan your programme</p>
            <h2 className="type-h2 mt-3">Useful corporate gifting pages</h2>
            <p className="type-body mt-4 max-w-2xl">Start with the recipient group or order type that best matches your brief. Each guide covers selection, branding and fulfilment considerations.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {usefulLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="group flex h-full items-center justify-between gap-4 border border-line bg-canvas px-5 py-4 text-sm font-semibold text-navy-950 transition-colors hover:border-navy-950">
                    <span>{label}</span><ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
