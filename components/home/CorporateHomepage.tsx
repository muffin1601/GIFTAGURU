import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, PackageCheck, Palette, Route, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CorporateHeroSlider from "@/components/home/CorporateHeroSlider";
import HomeProductCard from "@/components/home/HomeProductCard";
import { getPublishedBlogPosts } from "@/lib/blog/data";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";
import { getFeaturedProducts, getProductsBySlugs } from "@/lib/data/products";
import { expandProductSlugs } from "@/lib/seo/content/products";
import type { BlogPost } from "@/lib/blog/types";

const occasions = [
  { title: "Employee Welcome Kits", eyebrow: "New beginnings", href: "/gifting/employee-onboarding", image: "/images/editorial/employee-welcome-workspace.webp", alt: "Notebooks, pen and coffee arranged on a modern workspace", className: "sm:col-span-2 lg:col-span-7" },
  { title: "Corporate Diwali Gifts", eyebrow: "Festive gifting", href: "/diwali-2026", image: "/Diwali kits/Set 8/Primary_1.webp", alt: "Corporate Diwali gift box", className: "lg:col-span-5" },
  { title: "Client Appreciation", eyebrow: "Relationship gifting", href: "/gifting/client-appreciation", image: "/Gifta Guru/Set 12/1 (1).png", alt: "Premium client appreciation gift set", className: "lg:col-span-4" },
  { title: "Employee Rewards", eyebrow: "Celebrate people", href: "/gifting/employee-appreciation", image: "/Gifta Guru/Set 18/1 (1).png", alt: "Employee reward gift set", className: "lg:col-span-4" },
  { title: "Conference & Event Gifts", eyebrow: "Make the moment", href: "/gifting/events-conferences", image: "/catalogue-2026-images/page-03-img-06_720x541.png", alt: "Corporate event gifting collection", className: "sm:col-span-2 lg:col-span-4" },
  { title: "Executive Gifts", eyebrow: "Leadership moments", href: "/gifting/executive-leadership", image: "/Gifta Guru/Set 21/1 (1).png", alt: "Black executive corporate gift set", className: "lg:col-span-4" },
];

const servicePoints = [
  { label: "Bulk Corporate Orders", icon: PackageCheck },
  { label: "Custom Logo Branding", icon: Palette },
  { label: "Pan-India Delivery", icon: Route },
  { label: "Curated Premium Gifts", icon: Sparkles },
];

const capabilities = ["Logo printing", "Laser engraving", "Custom packaging", "Personalised cards", "Branded gift boxes"];

const reasons = [
  ["Curated Product Selection", "Useful products and considered combinations for each audience, occasion and budget."],
  ["Custom Branding Options", "Logo printing, engraving, packaging and inserts designed around your identity."],
  ["Bulk Order Support", "Practical help with quantities, approval stages and procurement requirements."],
  ["Quality-Focused Fulfilment", "Every order is prepared and checked before it leaves for delivery."],
  ["Multi-Location Delivery", "Coordinate gifting for offices and recipients across India."],
  ["Dedicated Assistance", "One team stays close to the brief from selection through dispatch."],
];

const gallerySlugs = [
  "diwali-signature-hamper",
  "luxury-planner-gift-box",
  "blue-notebook-welcome-set",
  "black-executive-corporate-set",
  "copper-celebration-hamper",
  "white-premium-corporate-gift-set",
  "executive-onboarding-essentials-set",
  "client-appreciation-desk-set",
  "refined-folio-pen-gift-set",
  "luxury-clutch-executive-set",
  "sage-green-sustainable-gift-set",
  "brown-luxury-stationery-set",
];

function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link href={href} className={`group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${light ? "text-cream-100" : "text-navy-950"}`}><span className="link-underline">{children}</span><ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></Link>;
}

function SectionIntro({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <div className="max-w-3xl"><p className={`type-eyebrow ${light ? "!text-gold-300" : ""}`}>{eyebrow}</p><h2 className={`mt-3 font-display text-[clamp(1.9375rem,1.4973rem+1.9565vw,3.0625rem)] font-bold leading-[1.15] tracking-[-1px] ${light ? "text-cream-100" : "text-navy-950"}`}>{title}</h2>{copy ? <p className={`mt-4 max-w-2xl text-[clamp(0.875rem,0.8261rem+0.2174vw,1rem)] leading-6 ${light ? "text-cream-100/70" : "text-ink-700"}`}>{copy}</p> : null}</div>;
}

function BlogHighlights({ resources }: { resources: BlogPost[] }) {
  const [lead, ...supporting] = resources;
  if (!lead) return null;

  return (
    <section className="section border-y border-navy-800 bg-navy-950 text-cream-100" aria-labelledby="home-journal-heading">
      <Container>
        <div className="grid gap-8 border-b border-cream-100/20 pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-script text-lg text-gold-300">The Gifta Guru journal</p>
            <h2 id="home-journal-heading" className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5vw,4.25rem)] font-bold leading-none tracking-[-0.035em]">
              Ideas that make business gifting easier.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-cream-100/68 sm:text-base">
              Practical guidance for choosing corporate gifts, planning budgets and creating a smoother experience for every recipient.
            </p>
          </div>
          <Link href="/blog" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-300">
            Explore all gifting guides
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="home-journal-card hanna-card group grid overflow-hidden border border-cream-100/15 !bg-navy-900 p-3 sm:grid-cols-[0.95fr_1.05fr] sm:p-4">
            <Link href={`/blog/${lead.slug}`} className="hanna-image relative min-h-[20rem] overflow-hidden bg-sunken">
              <Image
                src={lead.featuredImageUrl}
                alt={lead.featuredImageAlt}
                fill
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 48vw, 100vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
              />
            </Link>
            <div className="flex flex-col justify-center px-4 py-7 sm:px-7 sm:py-8">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-300">Featured · {lead.category}</p>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">
                <Link href={`/blog/${lead.slug}`}>{lead.title}</Link>
              </h3>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-cream-100/68">{lead.excerpt}</p>
              <Link href={`/blog/${lead.slug}`} className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cream-100">
                Read the guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <div className="grid gap-4">
            {supporting.map((post, index) => (
              <article key={post.slug} className="home-journal-card hanna-card group grid grid-cols-[6.5rem_1fr] gap-5 border border-cream-100/15 !bg-navy-900 p-4 sm:grid-cols-[9rem_1fr] sm:p-5">
                <Link href={`/blog/${post.slug}`} className="hanna-soft relative min-h-32 overflow-hidden bg-sunken">
                  <Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill sizes="144px" className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
                </Link>
                <div className="flex min-w-0 flex-col justify-center py-2 pr-1 sm:pr-2">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-gold-300">0{index + 2} · {post.category}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <Link href={`/blog/${post.slug}`} className="mt-3 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.11em] text-cream-100/75">
                    Read guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default async function CorporateHomepage() {
  const [collections, products, galleryProducts, posts] = await Promise.all([
    getFeaturedCollectionsAsCategories(), getFeaturedProducts(4),
    getProductsBySlugs(expandProductSlugs(gallerySlugs)),
    getPublishedBlogPosts(),
  ]);
  const resources = posts.slice(0, 3);

  return <div className="homepage-premium overflow-hidden">
    <CorporateHeroSlider />

    <section aria-label="Gifta Guru service benefits" className="border-b border-line bg-navy-950 text-cream-100"><Container><ul className="grid grid-cols-2 lg:grid-cols-4">{servicePoints.map(({ label, icon: Icon }) => <li key={label} className="flex min-h-24 items-center gap-3 border-r border-cream-100/15 px-3 py-5 last:border-r-0 sm:px-6"><Icon className="h-5 w-5 shrink-0 text-gold-300" strokeWidth={1.4} aria-hidden="true" /><span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream-100/80">{label}</span></li>)}</ul></Container></section>

    <section id="business-moments" className="section bg-canvas"><Container><div className="mx-auto text-center"><SectionIntro eyebrow="Gifts for every business moment" title="For the welcome, the win and every milestone." copy="From first days to lasting partnerships, explore corporate gifting designed for meaningful connections." /></div><div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{occasions.map((item, index) => <Link key={item.title} href={item.href} className="hanna-arch-frame group flex min-h-[25rem] flex-col bg-surface p-5"><div className="flex items-start justify-between"><div><p className="type-eyebrow">0{index + 1}</p><h3 className="mt-2 font-display text-2xl font-semibold text-navy-950">{item.title}</h3></div><ArrowRight className="mt-1 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></div><p className="mt-2 text-xs uppercase tracking-[0.12em] text-ink-500">{item.eyebrow}</p><div className="hanna-soft relative mt-5 min-h-0 flex-1 bg-[#eeefec]"><Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-4 transition-opacity duration-200 group-hover:opacity-85" /></div></Link>)}</div></Container></section>

    <section className="border-y border-line bg-surface">
      <Container className="py-10 lg:py-14">
        <div className="hanna-card overflow-hidden border border-line bg-navy-950 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[24rem] overflow-hidden bg-[#e5e2d8] sm:min-h-[30rem] lg:min-h-[32rem]">
            <Image
              src="/Hampers/set 1/1 (1).webp"
              alt="Curated corporate hamper with drinkware, snacks and cookies"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain p-7 sm:p-10"
            />
            <div className="absolute bottom-5 left-5 max-w-52 border border-navy-950/10 bg-surface/95 px-4 py-3 backdrop-blur-sm sm:bottom-7 sm:left-7">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-gold-700">The Gifta Guru edit</p>
              <p className="mt-1 font-display text-lg leading-snug text-navy-950">Useful gifts, beautifully considered.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12 xl:p-16">
            <SectionIntro
              eyebrow="About Gifta Guru"
              title="More than gifts. We create meaningful connections."
              copy="We help businesses turn everyday moments into memorable experiences through thoughtful, customised corporate gifting."
              light
            />
            <p className="mt-5 max-w-xl text-sm leading-7 text-cream-100/70">
              From employee welcome kits to client hampers and festive programmes, we bring product selection, branding and delivery into one clear process.
            </p>
            <ul className="mt-8 grid grid-cols-3 border-y border-cream-100/15 py-5 text-center">
              {["Curated", "Customised", "Delivered"].map((item, index) => (
                <li key={item} className="border-r border-cream-100/15 px-2 last:border-r-0">
                  <span className="block font-display text-2xl text-gold-300">0{index + 1}</span>
                  <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cream-100/75">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8"><ArrowLink href="/about" light>Discover our story</ArrowLink></div>
          </div>
        </div>
      </Container>
    </section>

    <section className="section bg-cream-200"><Container><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><SectionIntro eyebrow="Signature corporate collections" title="Crafting meaning into every collection." /><ArrowLink href="/categories">View all collections</ArrowLink></div><div className="mt-11 grid gap-5 md:grid-cols-2">{collections.slice(0, 6).map((collection, index) => <Link key={collection.slug} href={`/categories/${collection.slug}`} className="hanna-card group block bg-surface p-3 pb-6"><div className="hanna-image relative aspect-[16/10] bg-[#eeefec]"><Image src={collection.image} alt={`${collection.name} corporate gifting collection`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-5 transition-opacity duration-200 group-hover:opacity-85" /></div><div className="mt-4 flex items-start justify-between gap-5 px-2"><div><p className="type-eyebrow">0{index + 1} / Collection</p><h3 className="mt-2 font-display text-2xl font-semibold text-navy-950">{collection.name}</h3><p className="type-body mt-2 max-w-xl">{collection.description}</p></div><ArrowRight className="mt-2 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></div></Link>)}</div></Container></section>

    <section className="section bg-canvas">
      <Container>
        <div className="flex flex-col justify-between gap-7 border-b border-line pb-8 md:flex-row md:items-end">
          <SectionIntro
            eyebrow="Featured products"
            title="Curated gifts worth remembering."
            copy="A focused selection from our catalogue, ready for business gifting and customisation."
          />
          <ArrowLink href="/shop">Browse all gifts</ArrowLink>
        </div>
        {products.length ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <HomeProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <p className="border-b border-line py-8 text-ink-600">Our featured collection is being updated. Explore the full catalogue in the meantime.</p>
        )}
      </Container>
    </section>

    <section className="section border-y border-line bg-surface"><Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20"><div><SectionIntro eyebrow="Custom branding" title="Make every gift unmistakably yours." copy="From logo printing and engraving to premium packaging and personalised messages, every detail is designed around your brand." /><ul className="mt-8 border-y border-line py-2">{capabilities.map((item) => <li key={item} className="flex items-center justify-between border-b border-line py-4 text-sm text-ink-700 last:border-0"><span>{item}</span><Check className="h-4 w-4 text-gold-600" strokeWidth={1.5} aria-hidden="true" /></li>)}</ul><div className="mt-8"><Button href="/custom-gifts">Explore Custom Gifting</Button></div></div><div className="grid grid-cols-12 grid-rows-12 gap-4 lg:h-[40rem]"><div className="hanna-card relative col-span-8 row-span-8 min-h-[24rem] overflow-hidden bg-cream-200"><Image src="/images/editorial/custom-gift-preparation.webp" alt="Hands carefully finishing a deep green gift box" fill sizes="(min-width: 1024px) 35vw, 70vw" className="object-cover object-center" /></div><div className="hanna-arch-frame relative col-span-5 col-start-8 row-span-7 row-start-2 min-h-[18rem] bg-sunken"><Image src="/Gifta Guru/Set 16/1 (1).png" alt="Wood-finish branded stationery gift set" fill sizes="(min-width: 1024px) 22vw, 40vw" className="object-contain p-3" /></div><div className="hanna-card relative col-span-6 col-start-3 row-span-5 row-start-8 min-h-[16rem] overflow-hidden border-[10px] border-surface bg-sunken"><Image src="/Gifta Guru/Set 3/1 (1).png" alt="Premium customisable corporate gift set" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-3" /></div></div></Container></section>

    <section className="relative min-h-[29rem] overflow-hidden bg-navy-950"><Image src="/images/editorial/luxury-gift-packaging.webp" alt="Luxury green gift box finished with gold and ivory ribbon" fill sizes="100vw" className="object-cover object-center opacity-75" /><div className="absolute inset-0 bg-navy-950/65" /><Container className="relative flex min-h-[29rem] items-center justify-center py-16 text-center"><div className="max-w-2xl"><SectionIntro eyebrow="Bulk corporate gifting" title="Your brand deserves more than ordinary gifts." copy="Thoughtfully selected. Beautifully branded. Delivered with care." light /><div className="mt-8"><Button href="/bulk-enquiry" className="!border-cream-100 !bg-cream-100 !text-navy-950">Plan Your Corporate Gifting</Button></div></div></Container></section>

    <section className="section bg-surface"><Container className="grid gap-12 lg:grid-cols-[0.36fr_0.64fr] lg:gap-20"><div><SectionIntro eyebrow="Why choose Gifta Guru" title="Gifting made simple. Impressions made lasting." /><div className="relative mt-10 aspect-[4/5] overflow-hidden bg-sunken"><Image src="/Gifta Guru/Set 20/1 (1).png" alt="Premium brown corporate stationery set" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-contain p-5" /></div></div><ol className="border-t border-line">{reasons.map(([title, copy], index) => <li key={title} className="grid gap-3 border-b border-line py-7 sm:grid-cols-[4rem_0.8fr_1.2fr] sm:items-start"><span className="font-display text-3xl text-gold-600">0{index + 1}</span><h3 className="font-display text-2xl text-navy-950">{title}</h3><p className="type-body">{copy}</p></li>)}</ol></Container></section>

    {galleryProducts.length ? (
      <section className="section border-y border-line bg-cream-200">
        <Container>
          <div className="grid gap-7 border-b border-navy-950 pb-8 md:grid-cols-[1fr_auto] md:items-end">
            <SectionIntro
              eyebrow="A closer look"
              title="The art of thoughtful gifting."
              copy="Explore useful objects, refined packaging and memorable gift-set presentations selected from the Gifta Guru catalogue."
            />
            <div className="flex items-center gap-5">
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-500 sm:block">
                {Math.min(galleryProducts.length, 8)} curated pieces
              </span>
              <ArrowLink href="/shop">Explore the catalogue</ArrowLink>
            </div>
          </div>

          <div className="mt-8 grid auto-rows-[12rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] md:grid-cols-12 md:gap-4">
            {galleryProducts.slice(0, 8).map((product, index) => {
              const layout = index === 0
                ? "col-span-2 row-span-2 md:col-span-6"
                : index === 3
                  ? "col-span-2 md:col-span-6"
                  : "col-span-1 md:col-span-3";

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`hanna-soft group relative overflow-hidden border border-line bg-surface ${layout}`}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                      className="object-contain p-5 transition-transform duration-300 ease-out group-hover:-translate-y-1"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Image coming soon</span>
                  )}
                  <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface/90 font-display text-sm text-navy-950 backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/85 to-transparent px-4 pb-4 pt-14 text-cream-100 sm:px-5 sm:pb-5">
                    <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-gold-300">
                      {product.category.replaceAll("-", " ")}
                    </span>
                    <span className={`mt-1 block font-display leading-tight ${index === 0 ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}>
                      {product.name}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    ) : null}

    <section className="section bg-canvas"><Container><SectionIntro eyebrow="How corporate gifting works" title="From your idea to their unboxing." /><ol className="mt-12 grid border-y border-line md:grid-cols-4">{[["01", "Share Your Requirement", "Tell us the occasion, audience, quantity, budget and delivery plan."], ["02", "Select Your Gifts", "Review curated options chosen around your brief."], ["03", "Customise Your Branding", "Approve the branding, packaging and personal touches."], ["04", "We Prepare and Deliver", "We coordinate production, checking, packing and dispatch."]].map(([number, title, copy]) => <li key={number} className="border-b border-line py-8 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"><span className="font-display text-5xl text-gold-600">{number}</span><h3 className="mt-7 font-display text-2xl text-navy-950">{title}</h3><p className="type-body mt-3">{copy}</p></li>)}</ol><div className="mt-9"><Button href="/bulk-enquiry">Start Your Gifting Project</Button></div></Container></section>

    <BlogHighlights resources={resources} />

    <section className="border-t border-line bg-gold-400"><Container className="grid gap-9 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20"><div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-navy-950/70">Your next gifting project</p><h2 className="mt-4 max-w-4xl font-display text-[clamp(2.7rem,5vw,5.5rem)] leading-[0.96] tracking-[-0.04em] text-navy-950">Let&apos;s create something memorable together.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-navy-950/75">Tell us your occasion, budget and quantity. We&apos;ll help you find corporate gifts that represent your brand beautifully.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Button href="/bulk-enquiry">Request a Custom Quote</Button><Button href="/contact" variant="secondary" className="!border-navy-950/40">Contact Our Team</Button></div></Container></section>
  </div>;
}
