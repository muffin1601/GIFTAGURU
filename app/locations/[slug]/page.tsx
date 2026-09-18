import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { ncrServiceAreas, serviceAreaBySlug } from "@/lib/seo/locations";

export function generateStaticParams() { return ncrServiceAreas.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const area = serviceAreaBySlug((await params).slug);
  if (!area) return pageMetadata({ title: "Location not found | Gifta Guru", description: "This service area is not available.", path: "/locations", index: false });
  return pageMetadata({ title: `Corporate Diwali Gifts in ${area.name} | Gifta Guru`, description: `Corporate Diwali gifts, Diwali corporate gift kits and corporate gifting support for employee and client programmes in ${area.name}.`, path: `/locations/${area.slug}` });
}

export default async function ServiceAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const area = serviceAreaBySlug((await params).slug); if (!area) notFound();
  return <><JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }, { name: area.name, path: `/locations/${area.slug}` }])} /><section className="border-b border-line"><Container className="py-14"><nav className="type-meta flex gap-2" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/locations">Locations</Link><span>/</span><span>{area.name}</span></nav><span className="type-eyebrow mt-8 block">Diwali corporate gifting</span><h1 className="type-h1 mt-4">Corporate Diwali gifts in {area.name}</h1><p className="type-lead mt-5 max-w-3xl">Plan Diwali corporate gift kits for employees, clients and business partners in {area.name}. Share your recipient list, branding requirements and delivery split for a relevant corporate gifting quote.</p><Button href="/bulk-enquiry" variant="primary" className="mt-8">Request a Diwali Quote</Button></Container></section><Container className="py-14"><div className="max-w-3xl space-y-10"><section><h2 className="type-h2">Corporate Diwali gifting for employees and clients</h2><p className="type-body mt-4">Choose the recipient group and gift tier before selecting products. Employee lists usually need a consistent, scalable kit; client lists may need a more considered premium or luxury Diwali corporate gift. The correct option depends on the programme, not a generic city-specific catalogue.</p></section><section><h2 className="type-h2">Delivery planning for {area.name}</h2><p className="type-body mt-4">Gifta Guru supports pan-India and multi-location dispatch. Include every delivery address or office split in the enquiry so the team can plan the Diwali corporate gifting programme around the actual recipient list.</p></section><section><h2 className="type-h2">Explore Diwali corporate gifts</h2><ul className="mt-5 space-y-3"><li><Link className="link-underline" href="/diwali-2026">Corporate Diwali gifts and hampers</Link></li><li><Link className="link-underline" href="/categories/tech-electronics">Branded corporate gadgets and technology gifts</Link></li><li><Link className="link-underline" href="/blog/tech-corporate-gifting-kits">Corporate tech gifting kits</Link></li></ul></section></div></Container></>;
}
