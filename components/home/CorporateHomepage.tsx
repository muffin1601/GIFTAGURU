import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CorporateHeroSlider from "@/components/home/CorporateHeroSlider";
import HomeProductCard from "@/components/home/HomeProductCard";
import { getPublishedBlogPosts } from "@/lib/blog/data";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";
import { getFeaturedProducts, getProductsBySlugs } from "@/lib/data/products";
import { getTestimonials } from "@/lib/data/content";
import { expandProductSlugs } from "@/lib/seo/content/products";

const useCases = [
  { title: "Employee Welcome Kits", href: "/gifting/employee-onboarding", image: "/Gifta Guru/Set 1/1 (1).png", alt: "Blue diary and pen employee welcome kit" },
  { title: "Client Appreciation", href: "/gifting/client-appreciation", image: "/Gifta Guru/Set 12/1 (1).png", alt: "Premium corporate client gift set" },
  { title: "Corporate Diwali Gifts", href: "/diwali-2026", image: "/Diwali kits/Set 8/Primary_1.webp", alt: "Festive Diwali corporate gift hamper" },
  { title: "Employee Rewards", href: "/gifting/employee-appreciation", image: "/Gifta Guru/Set 18/1 (1).png", alt: "Employee appreciation gift box" },
  { title: "Conference & Event Gifts", href: "/gifting/events-conferences", image: "/catalogue-2026-images/page-03-img-06_720x541.png", alt: "Corporate event gift collection" },
  { title: "Work Anniversaries", href: "/occasions/work-anniversary-milestones", image: "/Gifta Guru/Set 19/1 (1).png", alt: "Corporate anniversary gift set" },
  { title: "Leadership Gifts", href: "/gifting/executive-leadership", image: "/BANNERS/LUXURY.png", alt: "Luxury executive corporate gifting collection" },
  { title: "Festive Hampers", href: "/occasions/festive-corporate-gifting", image: "/Hampers/set 3/1 (1).webp", alt: "Premium festive corporate hamper" },
];

const reasons = [
  ["Curated product selection", "Useful products and thoughtful combinations for every business moment."],
  ["Flexible MOQs", "Plan one programme or several recipient tiers around your requirements."],
  ["Custom branding", "Apply logos, names, sleeves and brand details with considered restraint."],
  ["Quality control", "Every order is checked before it reaches your team or recipients."],
  ["Bulk fulfilment", "Coordinate quantities, packing and recipient lists from one place."],
  ["Multi-location delivery", "Send one campaign to offices and homes across India."],
  ["Dedicated account support", "Work with a team that understands your campaign, not just a cart."],
  ["Corporate invoicing", "Keep procurement and finance requirements straightforward."],
];

const mosaic = [
  { image: "/Hampers/set 1/1 (1).webp", alt: "Black tumbler festive gift hamper", className: "md:col-span-2 md:row-span-2" },
  { image: "/Gifta Guru/Set 1/1 (1).png", alt: "Blue notebook and pen gift set", className: "" },
  { image: "/Diwali kits/Set 8/Primary_1.webp", alt: "Diwali mug, wallet and chocolate hamper", className: "" },
  { image: "/Gifta Guru/Set 20/1 (1).png", alt: "Corporate stationery gift box", className: "md:col-span-2" },
  { image: "/Hampers/set 2/1 (1).webp", alt: "Copper bottle corporate hamper", className: "" },
  { image: "/Gifta Guru/Set 24/1 (1).png", alt: "Premium corporate gift set", className: "" },
  { image: "/Diwali kits/Set 4/Primary.webp", alt: "Corporate festive gift box", className: "md:col-span-2" },
];

const diwaliSlugs = ["diwali-signature-hamper", "diwali-celebration-hamper", "diwali-grand-hamper"];

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy-950"><span className="link-underline">{children}</span><ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></Link>;
}

export default async function CorporateHomepage() {
  const [collections, products, diwaliProducts, posts, testimonials] = await Promise.all([
    getFeaturedCollectionsAsCategories(),
    getFeaturedProducts(4),
    getProductsBySlugs(expandProductSlugs(diwaliSlugs)),
    getPublishedBlogPosts(),
    getTestimonials(),
  ]);
  const resources = posts.slice(0, 3);

  return <main className="homepage-premium">
    <CorporateHeroSlider />

    <section className="border-b border-line bg-sunken"><Container><ul className="grid grid-cols-2 py-5 sm:grid-cols-3 lg:grid-cols-6">{["Bulk corporate orders", "Custom branding", "Employee gifting", "Client gifting", "Pan-India delivery", "Dedicated support"].map((item) => <li key={item} className="border-line px-3 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink-700 sm:border-r sm:last:border-r-0">{item}</li>)}</ul></Container></section>

    <section className="section"><Container><div className="max-w-2xl"><p className="type-eyebrow">Shop by corporate gifting need</p><h2 className="type-h2 mt-3">Built for the moments your business is marking.</h2></div><div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{useCases.map((item) => <Link key={item.title} href={item.href} className="group block"><div className="relative aspect-[4/3] overflow-hidden border border-line bg-sunken"><Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-3 transition-opacity duration-200 group-hover:opacity-85" /></div><div className="mt-4 flex items-center justify-between gap-4"><h3 className="font-display text-xl text-navy-950">{item.title}</h3><ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></div></Link>)}</div></Container></section>

    <section className="section border-y border-line bg-surface"><Container><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="type-eyebrow">Featured corporate collections</p><h2 className="type-h2 mt-3">Useful, elevated and ready to make your own.</h2></div><ArrowLink href="/categories">View all collections</ArrowLink></div><div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{collections.map((collection) => <Link key={collection.slug} href={`/categories/${collection.slug}`} className="group block"><div className="relative aspect-[4/3] overflow-hidden border border-line bg-sunken"><Image src={collection.image} alt={`${collection.name} corporate gifting collection`} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-3 transition-opacity duration-200 group-hover:opacity-85" /></div><p className="type-eyebrow mt-5">Collection</p><h3 className="mt-2 font-display text-2xl text-navy-950">{collection.name}</h3><p className="type-body mt-2">{collection.description}</p><span className="mt-5 block"><ArrowLink href={`/categories/${collection.slug}`}>Explore</ArrowLink></span></Link>)}</div></Container></section>

    <section className="section"><Container><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="type-eyebrow">Featured products</p><h2 className="type-h2 mt-3">Corporate gifting that earns a place on the desk.</h2></div><ArrowLink href="/shop">Browse all gifts</ArrowLink></div><div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <HomeProductCard key={product.id} product={product} />)}</div></Container></section>

    <section className="section border-y border-line bg-sunken"><Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"><div className="relative aspect-[4/3] overflow-hidden border border-line bg-surface"><Image src="/BANNERS/PREMIUM.png" alt="Custom branded premium corporate gift collection" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-4" /></div><div><p className="type-eyebrow">Custom branding</p><h2 className="type-h2 mt-3">Make every gift feel like your brand.</h2><p className="type-lead mt-5">Bring your logo, colours and message into the details that recipients will actually use and remember.</p><div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 text-sm text-ink-700">{["Logo printing", "Laser engraving", "Custom packaging", "Personalized cards", "Employee names", "Branded sleeves", "Company colours", "Custom gift boxes"].map((item) => <p key={item}>{item}</p>)}</div><div className="mt-8"><Button href="/custom-gifts">Discuss Your Requirement</Button></div></div></Container></section>

    <section className="section bg-navy-950 text-cream-100"><Container><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><p className="type-eyebrow text-gold-300">Corporate Diwali gifting</p><h2 className="mt-3 font-display text-4xl leading-tight text-cream-100 sm:text-5xl">Thoughtfully curated for the festive season.</h2><p className="mt-5 max-w-lg text-base leading-relaxed text-cream-100/70">Employee and client hampers, branded packaging, bulk quantities and delivery planning for every office location.</p><div className="mt-8 flex flex-wrap gap-3"><Button href="/diwali-2026" className="!bg-cream-100 !text-navy-950 !border-cream-100">Explore Diwali Gifts</Button><Button href="/bulk-enquiry" variant="secondary" className="!border-cream-100/40 !text-cream-100">Get Bulk Pricing</Button></div></div><div className="grid grid-cols-3 gap-3">{diwaliProducts.slice(0, 3).map((product) => <Link key={product.id} href={`/products/${product.slug}`} className="group block"><div className="relative aspect-[3/4] overflow-hidden border border-cream-100/20 bg-cream-100/5"><Image src={product.image ?? "/BANNERS/PREMIUM.png"} alt={product.name} fill sizes="(min-width: 1024px) 20vw, 33vw" className="object-contain p-2 transition-opacity duration-200 group-hover:opacity-85" /></div><p className="mt-3 text-sm font-medium text-cream-100">{product.name}</p></Link>)}</div></div></Container></section>

    <section className="section"><Container className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16"><div><p className="type-eyebrow">Employee welcome kits</p><h2 className="type-h2 mt-3 max-w-xl">Welcome kits employees actually want to use.</h2><p className="type-lead mt-5 max-w-xl">Start a new chapter with useful desk essentials, drinkware, personal touches and packaging that feels like a real welcome.</p><ul className="mt-7 grid grid-cols-2 gap-x-6 border-y border-line py-5 text-sm text-ink-700 sm:grid-cols-3">{["Notebook", "Pen", "Bottle", "Tech accessories", "Tote or backpack", "Welcome card"].map((item) => <li key={item}>{item}</li>)}</ul><div className="mt-8"><Button href="/gifting/employee-onboarding">Build a Welcome Kit</Button></div></div><div className="grid grid-cols-5 gap-3"><div className="relative col-span-3 aspect-[4/5] overflow-hidden border border-line bg-sunken"><Image src="/BANNERS/JOINING.png" alt="Employee onboarding corporate gift collection" fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-contain p-4" /></div><div className="relative col-span-2 mt-10 aspect-[3/4] overflow-hidden border border-line bg-sunken"><Image src="/Gifta Guru/Set 1/1 (1).png" alt="Notebook and pen welcome gift set" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-contain p-3" /></div></div></Container></section>

    <section className="section border-y border-line bg-surface"><Container><div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="type-eyebrow">Why companies choose GiftaGuru</p><h2 className="type-h2 mt-3">A corporate gifting partner, from brief to delivery.</h2></div><div className="grid sm:grid-cols-2">{reasons.map(([title, copy]) => <div key={title} className="border-t border-line py-5 sm:pr-8"><h3 className="font-display text-xl text-navy-950">{title}</h3><p className="type-body mt-2">{copy}</p></div>)}</div></div></Container></section>

    <section className="section"><Container><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="type-eyebrow">A closer look</p><h2 className="type-h2 mt-3">A catalogue with more to discover.</h2></div><ArrowLink href="/shop">Explore the full catalogue</ArrowLink></div><div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">{mosaic.map((item, index) => <div key={item.image} className={`relative aspect-square overflow-hidden border border-line bg-sunken ${item.className}`}><Image src={item.image} alt={item.alt} fill sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} className="object-contain p-3" /></div>)}</div></Container></section>

    <section className="section border-y border-line bg-sunken"><Container><div className="max-w-2xl"><p className="type-eyebrow">How corporate ordering works</p><h2 className="type-h2 mt-3">A clear path from brief to delivery.</h2></div><ol className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">{[["01", "Share your requirement"], ["02", "Receive curated options"], ["03", "Approve branding & samples"], ["04", "Production & quality check"], ["05", "Delivery"]].map(([number, title]) => <li key={number} className="border-b border-line py-6 lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"><span className="font-display text-4xl text-gold-600">{number}</span><h3 className="mt-4 text-sm font-semibold text-navy-950">{title}</h3></li>)}</ol></Container></section>

    <section className="section"><Container><p className="type-eyebrow">Teams we serve</p><h2 className="type-h2 mt-3 max-w-2xl">For the people shaping culture, relationships and big moments.</h2><div className="mt-8 flex flex-wrap border-y border-line py-5">{["HR teams", "Procurement teams", "Startups", "Enterprises", "Agencies", "Financial services", "Technology companies", "Real estate", "Healthcare", "Education", "Events", "Hospitality"].map((team) => <span key={team} className="mr-4 border-r border-line pr-4 py-1 text-sm text-ink-700 last:border-r-0">{team}</span>)}</div></Container></section>

    {testimonials.length ? <section className="section border-y border-line bg-surface"><Container><p className="type-eyebrow">Trusted by businesses</p><h2 className="type-h2 mt-3">What corporate teams say about GiftaGuru.</h2><div className="mt-10 grid gap-8 sm:grid-cols-2">{testimonials.slice(0, 4).map((testimonial) => <figure key={testimonial.id} className="border-t border-line pt-6"><blockquote className="font-display text-2xl leading-relaxed text-navy-950">&ldquo;{testimonial.quote}&rdquo;</blockquote><figcaption className="mt-5 text-sm text-ink-700">{testimonial.name}{testimonial.role || testimonial.company ? `, ${[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}` : ""}</figcaption></figure>)}</div></Container></section> : null}

    {resources.length ? <section className="section"><Container><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="type-eyebrow">Corporate gifting resources</p><h2 className="type-h2 mt-3">Guidance for better gifting decisions.</h2></div><ArrowLink href="/blog">Visit the blog</ArrowLink></div><div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-3">{resources.map((post) => <article key={post.slug} className="border-t border-line pt-5"><div className="relative aspect-[4/3] overflow-hidden bg-sunken"><Image src={post.featuredImageUrl ?? "/BANNERS/PREMIUM.png"} alt={post.featuredImageAlt ?? "Corporate gifting guide by GiftaGuru"} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-3" /></div><p className="type-eyebrow mt-5">{post.category}</p><h3 className="mt-3 font-display text-2xl text-navy-950"><Link href={`/blog/${post.slug}`} className="link-underline">{post.title}</Link></h3><p className="type-body mt-3">{post.excerpt}</p><div className="mt-5"><ArrowLink href={`/blog/${post.slug}`}>Read article</ArrowLink></div></article>)}</div></Container></section> : null}

    <section className="border-t border-line bg-navy-950"><Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="type-eyebrow text-gold-300">Let&apos;s plan it together</p><h2 className="mt-3 font-display text-4xl text-cream-100 sm:text-5xl">Planning a corporate gifting campaign?</h2><p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-100/70">Tell us your quantity, budget, branding requirements and delivery locations. Our corporate gifting team will help curate the right options.</p></div><div className="flex flex-wrap gap-3"><Button href="/bulk-enquiry" className="!bg-cream-100 !text-navy-950 !border-cream-100">Request a Corporate Quote</Button><Button href="/contact" variant="secondary" className="!border-cream-100/40 !text-cream-100">Talk to Our Team</Button></div></Container></section>
  </main>;
}
