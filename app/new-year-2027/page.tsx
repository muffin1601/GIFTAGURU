import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import HomeProductCard from "@/components/home/HomeProductCard";
import JsonLd from "@/components/seo/JsonLd";
import { getProductsBySlugs } from "@/lib/data/products";
import { calendarGallery, newYearCampaign } from "@/lib/campaign/new-year";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/env";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { expandProductSlugs } from "@/lib/seo/content/products";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "New Year 2027 Corporate Gifts & Calendars | Giftaguru",
  description: "Explore New Year 2027 corporate gifts, customized calendars, diaries, pens and premium gift kits at Giftaguru. Request a quote for bulk gifting.",
  path: "/new-year-2027",
  image: newYearCampaign.heroImage,
});

const quote = (subject: string) => `/bulk-enquiry?collection=${encodeURIComponent(subject)}`;

export default async function NewYearPage() {
  // Do not present bundled development fixtures as verified live inventory.
  let products: Awaited<ReturnType<typeof getProductsBySlugs>> = [];
  if (isDatabaseConfigured()) {
    try {
      const slugs = expandProductSlugs([...newYearCampaign.featuredSlugs]);
      const active = await prisma.product.findMany({ where: { status: "active", slug: { in: slugs } }, select: { id: true } });
      const ids = new Set(active.map((product) => product.id));
      if (ids.size) products = (await getProductsBySlugs(slugs)).filter((product) => ids.has(product.id));
    } catch {
      // The enquiry gallery remains useful if the catalogue is unavailable.
    }
  }
  const base = siteUrl();
  const url = `${base}/new-year-2027`;
  return <>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: base }, { "@type": "ListItem", position: 2, name: "New Year 2027", item: url }] },
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "New Year 2027 Corporate Gifts & Customized Gift Sets", url },
      ...(products.length ? [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: products.map((product, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}/products/${product.slug}`, name: product.name })) }] : []),
    ]} />
    <section className="bg-navy-950 text-cream-100">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div><nav aria-label="Breadcrumb" className="text-xs text-cream-100/70"><Link href="/">Home</Link> / New Year 2027</nav><p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">A thoughtful start to 2027</p><h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">New Year 2027 Corporate Gifts &amp; Customized Gift Sets</h1><p className="mt-6 font-display text-2xl text-gold-300">Celebrate New Beginnings with New Year 2027 Corporate Gifts</p><p className="mt-5 max-w-xl leading-7 text-cream-100/75">Explore customized calendars, diaries, planners, stationery, premium gift sets, and branded corporate gifting solutions for employees, clients, and business partners.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="bg-gold-400 px-6 py-4 text-sm font-semibold text-navy-950" href="#collection">Explore New Year Gifts</Link><Link className="border border-cream-100/50 px-6 py-4 text-sm font-semibold" href={quote("New Year 2027 corporate gifts")}>Get Bulk Quotation</Link></div></div>
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-200"><Image src={newYearCampaign.heroImage} alt="2027 calendar design from the New Year collection" fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-5" /></div>
      </Container>
    </section>
    <section id="collection" className="section bg-canvas"><Container><p className="type-eyebrow">The 2027 collection</p><h2 className="type-h2 mt-3">Explore New Year 2027 Corporate Gifts</h2><p className="type-body mt-4 max-w-2xl">Discover practical stationery and gift sets for a considered start to the year. Product selection and branding are confirmed with your quotation.</p>{products.length > 0 ? <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">{products.map(product => <HomeProductCard key={product.id} product={product} />)}</div> : <p className="mt-8">Explore the <Link className="underline" href="/shop">full catalogue</Link> or request a tailored selection.</p>}</Container></section>
    <section className="section bg-cream-200"><Container><p className="type-eyebrow">Design inspiration</p><h2 className="type-h2 mt-3">2027 Calendars — Start Every Day with Your Brand</h2><p className="type-body mt-4 max-w-3xl">Explore calendar designs for your next corporate gifting programme. These images are a design gallery; formats, branding, pricing and availability are confirmed on enquiry.</p><div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-5">{calendarGallery.map((src, index) => <article key={src} className="bg-surface p-3"><div className="relative aspect-square bg-white"><Image src={src} alt={`2027 calendar design ${index + 1}`} fill sizes="(min-width: 1024px) 19vw, 50vw" className="object-contain" /></div><h3 className="mt-4 font-display text-lg">Calendar design {index + 1}</h3><p className="mt-1 text-sm">Request price</p><Link href={quote(`2027 calendar design ${index + 1}`)} className="mt-4 inline-block text-sm font-semibold underline">Enquire now</Link></article>)}</div></Container></section>
    <section className="section bg-navy-950 text-cream-100"><Container className="grid gap-8 md:grid-cols-2 md:items-end"><div><p className="text-xs uppercase tracking-[0.18em] text-gold-300">Made around your brief</p><h2 className="mt-4 font-display text-4xl">Curated New Year 2027 Gift Kits</h2><p className="mt-5 max-w-xl leading-7 text-cream-100/75">Build a thoughtful combination for employees, new joiners or clients. Tell us which catalogue products, quantities and branding you have in mind; our team will confirm the options and prepare a custom quote.</p></div><div><Link href={quote("Custom New Year 2027 gift kit")} className="inline-block bg-gold-400 px-6 py-4 text-sm font-semibold text-navy-950">Customize Your Kit</Link></div></Container></section>
    <section className="section bg-canvas"><Container><h2 className="type-h2">Plan a meaningful New Year gift</h2><div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[
      ["Why give at New Year?", "A useful gift can mark a fresh start and acknowledge the people who contribute to your business throughout the year."],
      ["Customized calendars and diaries", "Calendars and diaries keep plans visible throughout the year. Discuss format, artwork and branding before selecting a design."],
      ["Gifts for employees", "Consider practical notebooks, pens and desk essentials that fit daily work, whether your team is in the office or working remotely."],
      ["Gifts for clients", "Choose a thoughtful set that suits the relationship and can be personalised with a message or your brand identity."],
      ["Selecting a gift kit", "Start with your audience, budget and delivery locations. Select complementary products and ask about packaging and branding options."],
      ["Requesting a bulk quote", "Share your preferred products, quantity, delivery city, date and artwork requirements. The team can confirm current options and pricing."],
    ].map(([heading, copy]) => <article key={heading}><h3 className="font-display text-2xl">{heading}</h3><p className="type-body mt-3">{copy}</p></article>)}</div><Link href={quote("New Year 2027 corporate gifts")} className="mt-10 inline-block underline">Request a customised bulk quotation</Link></Container></section>
  </>;
}
