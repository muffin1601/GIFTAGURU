import Image from "next/image";
import Link from "next/link";
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
export const metadata = pageMetadata({
  title: "New Year 2027 Corporate Gifts & Calendars | Giftaguru",
  description: "Explore New Year 2027 corporate gifts, customized calendars, diaries, pens and premium gift kits at Giftaguru. Request a quote for bulk gifting.",
  path: "/new-year-2027",
  image: newYearCampaign.bannerImage,
  imageAlt: "New Year 2027 corporate gifting collection",
});

const quote = (subject: string) => `/bulk-enquiry?collection=${encodeURIComponent(subject)}`;
const button = "inline-flex items-center justify-center bg-navy-950 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-navy-800";
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
  return <article className="group flex h-full flex-col border border-line bg-white p-3 sm:p-4">
    <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#f2f1ed]">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="absolute inset-0 grid place-items-center text-sm text-ink-600">Image unavailable</span>}</Link>
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
    <section className="bg-[#f7f3eb]">
      <Link href="#kits" aria-label="Explore New Year gift kits"><Image src={newYearCampaign.bannerImage} alt="New Year 2027 corporate gift kits for teams, clients and partners" width={2048} height={768} sizes="100vw" preload className="h-auto w-full" /></Link>
      <Container className="py-9 text-center sm:py-14"><nav aria-label="Breadcrumb" className="text-sm text-ink-600"><Link href="/" className="underline">Home</Link> / New Year 2027</nav><p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">A thoughtful start to the year</p><h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl leading-tight text-navy-950 sm:text-5xl">New Year 2027 Corporate Gifts &amp; Customized Gift Sets</h1><p className="mx-auto mt-5 max-w-2xl leading-7 text-ink-700">Celebrate new beginnings with considered gifts for employees, clients and partners. Explore calendars, stationery and corporate gift sets, then make them your own.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="#collection" className={button}>Explore New Year Collection</Link><Link href={quote("New Year 2027 corporate gifts")} className="inline-flex items-center justify-center border border-navy-950 px-6 py-4 text-sm font-semibold text-navy-950">Request Bulk Quotation</Link></div></Container>
    </section>
    <section id="collection" className="section bg-white"><Container><div className="max-w-2xl"><p className="type-eyebrow">A collection with purpose</p><h2 className="type-h2 mt-3">Shop New Year 2027 gifts</h2><p className="type-body mt-4">From a desk calendar seen every day to a gift set that makes a first impression, start with the essentials that suit your recipients.</p></div><div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">{categories.map(c => <Link key={c.title} href={c.href} className="group border border-line bg-[#faf9f6] p-3"><div className="relative aspect-square overflow-hidden bg-white"><Image src={c.image} alt={c.title} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" /></div><h3 className="mt-4 font-display text-xl text-navy-950">{c.title}</h3><p className="mt-2 text-sm leading-6 text-ink-700">{c.description}</p><span className="mt-4 inline-block text-sm font-semibold underline">Explore</span></Link>)}</div></Container></section>
    <section id="calendars" className="section bg-cream-200"><Container><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="type-eyebrow">The calendar edit</p><h2 className="type-h2 mt-3">2027 Calendars — Start Every Day with Your Brand</h2><p className="type-body mt-4 max-w-2xl">Explore the uploaded designs and their alternate views. These are an enquiry gallery; the team will confirm format, customisation, price and availability for your brief.</p></div><Link href={quote("2027 calendar designs")} className="text-sm font-semibold underline">Enquire about calendars</Link></div><div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-3">{calendarGallery.map(item => <article key={item.name} className="border border-line bg-white p-3 sm:p-4"><div className="relative aspect-[4/3] bg-[#f7f7f5]"><Image src={item.images[0]} alt={`${item.name} for corporate gifting`} fill sizes="(min-width: 1024px) 32vw, 50vw" className="object-contain p-2" /></div><h3 className="mt-4 font-display text-xl text-navy-950">{item.name}</h3><p className="mt-1 text-sm text-ink-700">Design gallery · Request price</p><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold underline">View all images</summary><div className="mt-3 grid grid-cols-2 gap-2">{item.images.slice(1).map((src, i) => <div key={src} className="relative aspect-square bg-[#f7f7f5]"><Image src={src} alt={`${item.name}, view ${i + 2}`} fill sizes="(min-width: 1024px) 15vw, 25vw" className="object-contain" /></div>)}</div></details><Link href={quote(item.name)} className="mt-4 inline-block text-sm font-semibold underline">Request quote</Link></article>)}</div></Container></section>
    {products.length > 0 && <section className="section bg-white"><Container><p className="type-eyebrow">Selected from our catalogue</p><h2 className="type-h2 mt-3">Featured New Year gifts</h2><p className="type-body mt-4 max-w-2xl">Explore existing stationery and gift sets for employees, clients and business partners. Follow each product for full details and current ordering information.</p><div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">{products.map(product => <ProductTile key={product.id} product={product} />)}</div></Container></section>}
    <section id="kits" className="section bg-[#f5f2eb]"><Container><p className="type-eyebrow">The gifting edit</p><h2 className="type-h2 mt-3">Curated New Year gift kits</h2><p className="type-body mt-4 max-w-2xl">Start with these existing catalogue sets, or tell us what you would like to bring together. Product contents and customisation are confirmed on each product page or in your quote.</p>{kits.length > 0 && <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">{kits.map(product => <ProductTile key={product.id} product={product} />)}</div>}<div className="mt-9 flex flex-wrap items-center justify-between gap-5 border border-gold-600/30 bg-white p-6 sm:p-8"><div><h3 className="font-display text-2xl">Make a kit your own</h3><p className="mt-2 max-w-xl text-sm leading-6 text-ink-700">Tell us your audience, product preferences and branding ideas for a personalised quotation.</p></div><Link href={quote("Custom New Year 2027 gift kit")} className={button}>Customize your kit</Link></div></Container></section>
    <section className="section bg-navy-950 text-cream-100"><Container><div className="grid gap-10 lg:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Thoughtfully brought together</p><h2 className="mt-4 font-display text-4xl leading-tight">Why choose Gifta Guru for corporate gifting?</h2><p className="mt-5 max-w-xl leading-7 text-cream-100/75">From selecting useful gifts to discussing branding and delivery, our team helps turn your requirements into a considered gifting programme.</p></div><div className="grid gap-6 sm:grid-cols-2">{[["Curated selection", "Explore stationery, desk essentials and gift sets for different recipients."], ["Branding options", "Discuss logo application and personalisation suited to your chosen products."], ["Bulk order support", "Share your quantities, timing and budget for a tailored quotation."], ["Delivery planning", "Include your delivery city or multiple locations in your brief."]].map(([h,p]) => <div key={h} className="border-t border-gold-300/50 pt-4"><h3 className="font-display text-2xl">{h}</h3><p className="mt-2 text-sm leading-6 text-cream-100/70">{p}</p></div>)}</div></div></Container></section>
    <section className="section bg-white"><Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="type-eyebrow">A smoother way to plan</p><h2 className="type-h2 mt-3">Bulk gifting for every business relationship</h2><p className="type-body mt-5">Whether you are welcoming employees, thanking clients, recognising partners or planning an event, begin with the people receiving your gift and the practical details of your order.</p><Link href={quote("New Year 2027 bulk corporate gifting")} className={`${button} mt-7`}>Plan your bulk order</Link></div><div><h2 className="font-display text-3xl text-navy-950">Frequently asked questions</h2><div className="mt-5 divide-y divide-line border-y border-line">{faqs.map(([q,a]) => <details key={q} className="py-5"><summary className="cursor-pointer font-semibold text-navy-950">{q}</summary><p className="mt-3 leading-7 text-ink-700">{a}</p></details>)}</div></div></Container></section>
    <section className="bg-gold-400"><Container className="flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-950/70">Let’s create something memorable</p><h2 className="mt-3 max-w-3xl font-display text-4xl text-navy-950">Make New Year 2027 Memorable with Giftaguru</h2></div><Link href={quote("New Year 2027 corporate gifts")} className={button}>Get Your Corporate Gifting Quote</Link></Container></section>
  </>;
}
