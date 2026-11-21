import Image from "next/image";
import Link from "next/link";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { getProductsBySlugs } from "@/lib/data/products";
import { calendarGallery, newYearCampaign } from "@/lib/campaign/new-year";
import { pageMetadata } from "@/lib/seo/metadata";
import { isDatabaseConfigured, siteUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { expandProductSlugs } from "@/lib/seo/content/products";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
const shareImage = `${siteUrl()}/new-year-2027-share.jpg`;
const pageSeo = pageMetadata({
  title: "New Year 2027 Corporate Gifts & Calendars | Giftaguru",
  description: "Explore New Year 2027 corporate gifts, customized calendars, diaries, pens and premium gift kits at Giftaguru. Request a quote for bulk gifting.",
  path: "/new-year-2027",
  image: shareImage,
  imageAlt: "New Year 2027 corporate gifting collection",
});
export const metadata = {
  ...pageSeo,
  openGraph: {
    ...pageSeo.openGraph,
    images: [{ url: shareImage, width: 1200, height: 630, type: "image/jpeg", alt: "New Year 2027 corporate gifting collection" }],
  },
};

const quote = (subject: string) => `/bulk-enquiry?collection=${encodeURIComponent(subject)}`;
const kitSlugs = ["blue-notebook-welcome-set", "executive-onboarding-essentials-set", "luxury-planner-gift-box", "complete-stationery-gift-set"];
const faqs = [
  ["Can New Year corporate gifts be customised?", "Many gifts can be branded or personalised. Options depend on the product, so share your artwork and preferences when requesting a quote."],
  ["Can I enquire about calendars in bulk?", "Yes. Choose a design and tell us your quantity, delivery city and branding requirements. The team will confirm formats, availability and pricing."],
  ["Can diaries be personalised?", "Personalisation varies by item and material. Ask the team about the available branding methods for your chosen diary or set."],
  ["Can we create a custom gift kit?", "Yes. Share the products you are considering, your recipients and budget. We will discuss suitable combinations and provide a quotation."],
  ["What is the minimum order quantity?", "Minimum quantities vary by product and order. Check the product page or include your planned quantity in your enquiry for confirmation."],
  ["How do I request a quotation?", "Use any enquiry button and include your quantity, delivery location, preferred date and branding requirements. Our team can then review the details with you."],
];

function ProductTile({ product }: { product: Product }) {
  return <article className="page-card group flex h-full flex-col p-3 sm:p-5">
    <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-[18px] bg-sunken">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="absolute inset-0 grid place-items-center text-sm text-ink-600">Image unavailable</span>}</Link>
    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">{product.category.replaceAll("-", " ")}</p>
    <h3 className="mt-2 font-display text-xl leading-snug text-navy-950"><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
    <p className="mt-3 text-sm font-semibold text-navy-950">{product.price !== null && product.price > 0 ? formatPrice(product.price) : "Request price"}</p>
    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-5 text-sm font-semibold"><Link className="underline" href={`/products/${product.slug}`}>View details</Link><Link className="underline" href={`/bulk-enquiry?product=${encodeURIComponent(product.name)}`}>Request quote</Link></div>
  </article>;
}

export default async function NewYearPage() {
  let products: Product[] = [];
  if (isDatabaseConfigured()) {
    try {
      const slugs = expandProductSlugs([...newYearCampaign.featuredSlugs]);
      const active = await prisma.product.findMany({ where: { status: "active", slug: { in: slugs } }, select: { id: true } });
      const ids = new Set(active.map((product) => product.id));
      if (ids.size) products = (await getProductsBySlugs(slugs)).filter((product) => ids.has(product.id));
    } catch { /* Keep the enquiry gallery available if the catalog is offline. */ }
  }
  const kits = kitSlugs.map(slug => products.find(p => p.slug === slug)).filter((p): p is Product => Boolean(p));
  const categories = [
    { title: "Calendars 2027", description: "Designs for a year of new beginnings", image: calendarGallery[0].images[0], href: "#calendars" },
    ...[
      { title: "Diaries & planners", description: "A considered companion for every workday", match: /diary|planner|journal/i },
      { title: "Notebooks & pens", description: "Everyday essentials, thoughtfully paired", match: /notebook|pen/i },
      { title: "Corporate gift sets", description: "Ready-to-explore sets for business gifting", match: /gift set|welcome set/i },
    ].flatMap(item => { const product = products.find(p => item.match.test(p.name) && p.image); return product?.image ? [{ title: item.title, description: item.description, image: product.image, href: `/products/${product.slug}` }] : []; }),
  ];
  const base = siteUrl();
  const url = `${base}/new-year-2027`;
  return <>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: base }, { "@type": "ListItem", position: 2, name: "New Year 2027", item: url }] },
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "New Year 2027 Corporate Gifts & Customized Gift Sets", url },
      ...(products.length ? [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: products.map((product, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}/products/${product.slug}`, name: product.name })) }] : []),
    ]} />
    <section className="page-hero border-b border-line bg-canvas">
      {/* Same frame as the homepage hero banner (CorporateHeroSlider). */}
      <Container className="pt-4 sm:pt-6">
        <Link href="#kits" aria-label="Explore New Year gift kits" className="relative block aspect-[8/3] overflow-hidden rounded-xl bg-sunken focus-visible:outline-offset-[-4px] sm:rounded-2xl">
          <Image src={newYearCampaign.bannerImage} alt="New Year 2027 corporate gift kits" fill sizes="(min-width: 84rem) 78rem, (min-width: 64rem) calc(100vw - 6rem), (min-width: 40rem) calc(100vw - 4rem), calc(100vw - 2.5rem)" preload className="object-contain" />
        </Link>
      </Container>
      <Container className="pb-8 pt-5 sm:pb-12 sm:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-600">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">New Year 2027</span>
        </nav>
        <div className="mt-5 grid items-end gap-6 sm:mt-7 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="type-h1">
              New Year 2027 Corporate Gifts
            </h1>
            <p className="type-lead mt-4 max-w-2xl">
              Discover calendars, personalised stationery and curated gift sets for your team, clients and partners.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="#collection">Explore collection</Button>
            <Button href={quote("New Year 2027 corporate gifts")} variant="secondary">Request a bulk quote</Button>
          </div>
        </div>
      </Container>
    </section>
    <section id="collection" className="site-section section scroll-mt-48 bg-canvas">
      <Container>
        <SectionHeading title="Shop by gift type" description="Find a calendar, a desk essential or a gift set for the people on your list." />
        <div className="catalogue-grid mt-8 grid sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <Link key={category.title} href={category.href} className="page-card group flex flex-col p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-sunken">
                <Image src={category.image} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 90vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-navy-950">{category.title}</h3>
              <p className="type-body mt-2 mb-4">{category.description}</p>
              <span className="link-underline mt-auto self-start text-sm font-semibold">Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
    <section id="calendars" className="site-section section scroll-mt-48 border-y border-line bg-sunken">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading title="2027 calendars" description="Open a gallery to compare views, or enquire about branding, formats and bulk pricing." />
          <Button href={quote("2027 calendar designs")} variant="secondary">Enquire about calendars</Button>
        </div>
        <div className="catalogue-grid mt-8 grid items-start sm:grid-cols-2 lg:grid-cols-3">
          {calendarGallery.map(item => (
            <article key={item.name} className="page-card p-4 sm:p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-sunken">
                <Image src={item.images[0]} alt={item.name} fill sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 90vw" className="object-contain p-3" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-navy-950">{item.name}</h3>
              <details className="my-4 border-y border-line">
                <summary className="cursor-pointer py-3 text-sm font-semibold">View all {item.images.length} images</summary>
                <div className="grid grid-cols-2 gap-2 pb-4">
                  {item.images.slice(1).map((src, index) => (
                    <div key={src} className="relative aspect-square rounded-lg bg-sunken">
                      <Image src={src} alt={`${item.name}, view ${index + 2}`} fill sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 43vw" className="object-contain" />
                    </div>
                  ))}
                </div>
              </details>
              <Link href={quote(item.name)} className="link-underline text-sm font-semibold">Request a quote &rarr;</Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
    {products.length > 0 && (
      <section className="site-section section bg-canvas">
        <Container>
          <SectionHeading title="Featured New Year gifts" description="Explore stationery and gift sets for employees, clients and business partners." />
          <div className="catalogue-grid mt-8 grid grid-cols-2 lg:grid-cols-4">
            {products.map(product => <ProductTile key={product.id} product={product} />)}
          </div>
        </Container>
      </section>
    )}
    <section id="kits" className="site-section section scroll-mt-48 bg-sunken">
      <Container>
        <SectionHeading title="Curated New Year gift kits" description="Choose a set or build your own with products, packaging and branding to suit your recipients." />
        {kits.length > 0 && (
          <div className="catalogue-grid mt-8 grid grid-cols-2 lg:grid-cols-4">
            {kits.map(product => <ProductTile key={product.id} product={product} />)}
          </div>
        )}
        <div className="editorial-panel mt-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h3 className="font-display text-3xl text-navy-950">Make a kit your own</h3>
            <p className="type-body mt-2">Share your audience, budget and branding ideas for a personalised quotation.</p>
          </div>
          <Button href={quote("Custom New Year 2027 gift kit")}>Customise your kit</Button>
        </div>
      </Container>
    </section>
    <section className="site-section section bg-navy-950 text-cream-100">
      <Container className="grid gap-10 lg:grid-cols-2">
        <SectionHeading tone="dark" title="Corporate gifting with Gifta Guru" description="Our team can help you select gifts, personalise the packaging and plan delivery for your New Year order." />
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            ["Gift selection", "Choose stationery, desk essentials and sets for each recipient."],
            ["Branding options", "Discuss logo placement and personalisation for your chosen items."],
            ["Bulk orders", "Share quantities, timing and budget for a tailored quotation."],
            ["Delivery planning", "Include your delivery city or multiple locations in your brief."],
          ].map(([title, description]) => (
            <div key={title} className="border-t border-gold-300/50 pt-4">
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-cream-100/75">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
    <section className="site-section section bg-canvas">
      <Container className="grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <SectionHeading title="New Year gifting FAQs" description="Find answers about branding, minimum quantities and requesting a bulk quote." />
        <div className="page-card px-5 sm:px-8">
          <Accordion items={faqs.map(([question, answer], index) => ({ id: `new-year-${index}`, question, answer }))} />
        </div>
      </Container>
    </section>
    <section className="border-t border-line bg-gold-400">
      <Container className="flex flex-wrap items-center justify-between gap-6 py-12 lg:py-16">
        <h2 className="type-h2">Plan your New Year gift order</h2>
        <Button href={quote("New Year 2027 corporate gifts")}>Get a corporate gifting quote</Button>
      </Container>
    </section>
  </>;
}
