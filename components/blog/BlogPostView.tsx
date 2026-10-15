import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import ProductCard from "@/components/ui/ProductCard";
import { breadcrumbSchema, blogPostingSchema, faqPageSchema } from "@/lib/seo/schema";
import { getProductsBySlugs } from "@/lib/data/products";
import { expandProductSlugs } from "@/lib/seo/content/products";
import type { BlogPost } from "@/lib/blog/types";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostView({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  const products = await getProductsBySlugs(expandProductSlugs(post.recommendedProductSlugs));
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd data={[
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gifting Guides", path: "/blog" }, { name: post.title, path }]),
        blogPostingSchema({ ...post, path }),
        faqPageSchema(post.faqs),
      ]} />

      <header className="border-b border-line bg-cream-200">
        <Container className="pt-6 sm:pt-8">
          <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Gifting Guides</Link><span aria-hidden="true">/</span><span className="text-navy-950">{post.title}</span>
          </nav>
        </Container>
        <Container className="grid gap-10 pb-14 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:pb-20">
          <div>
            <p className="font-script text-lg text-gold-700">{post.category}</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,5.75rem)] font-bold leading-[0.96] tracking-[-0.04em] text-navy-950">{post.title}</h1>
            <p className="type-lead mt-6 max-w-3xl">{post.excerpt}</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-600">
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-gold-600" strokeWidth={1.5} aria-hidden="true" />{post.authorName ?? "Gifta Guru Team"}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold-600" strokeWidth={1.5} aria-hidden="true" /><time dateTime={post.publishedAt.toISOString()}>{dateFormat.format(post.publishedAt)}</time></span>
            </div>
          </div>
          <div className="hanna-arch-frame relative order-first aspect-[4/3] bg-surface lg:order-none">
            <Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
          </div>
        </Container>
      </header>

      <main className="bg-canvas">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <article className="min-w-0">
            <div className="space-y-6">
              {post.sections.map((section, index) => (
                <section key={section.heading} className="editorial-panel">
                  <div className="flex items-start gap-4"><span className="font-display text-2xl text-gold-600">{String(index + 1).padStart(2, "0")}</span><h2 className="type-h2">{section.heading}</h2></div>
                  {section.body?.map((paragraph) => <p key={paragraph} className="type-body mt-5">{paragraph}</p>)}
                  {section.bullets?.length ? <ul className="mt-5 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="type-body flex gap-3"><span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" /><span>{bullet}</span></li>)}</ul> : null}
                </section>
              ))}
            </div>

            {products.length ? (
              <section className="mt-16 border-t border-line pt-10">
                <p className="type-eyebrow">Shop the guide</p><h2 className="type-h2 mt-3">Relevant gift sets</h2>
                <div className="catalogue-grid mt-8 grid sm:grid-cols-2">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
              </section>
            ) : null}

            {post.faqs.length ? (
              <section className="editorial-panel mt-16">
                <p className="type-eyebrow">Quick answers</p><h2 className="type-h2 mt-3">Frequently asked questions</h2>
                <dl className="mt-8 divide-y divide-line">{post.faqs.map((faq) => <div key={faq.question} className="py-6 first:pt-0 last:pb-0"><dt className="font-display text-xl font-semibold text-navy-950">{faq.question}</dt><dd className="type-body mt-3">{faq.answer}</dd></div>)}</dl>
              </section>
            ) : null}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-40">
            <div className="hanna-card bg-navy-950 p-6 text-cream-100">
              <p className="font-script text-lg text-gold-300">Build your brief</p>
              <h2 className="mt-3 font-display text-2xl font-semibold">Plan your corporate gifting project</h2>
              <p className="mt-4 text-sm leading-6 text-cream-100/70">Share your audience, quantity, budget and branding needs for a relevant shortlist.</p>
              <Button href="/bulk-enquiry" className="mt-6 !border-gold-400 !bg-gold-400 !text-navy-950">Request a quote</Button>
            </div>
            {post.relatedLinks.length ? (
              <nav className="hanna-card border border-line bg-surface p-6" aria-label="Continue exploring">
                <p className="type-eyebrow">Continue exploring</p>
                <ul className="mt-4 divide-y divide-line">{post.relatedLinks.map((link) => <li key={link.href}><Link href={link.href} className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-navy-950"><span>{link.label}</span><ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link></li>)}</ul>
              </nav>
            ) : null}
          </aside>
        </Container>

        {related.length ? (
          <section className="border-t border-line bg-cream-200 py-14 sm:py-20">
            <Container>
              <p className="type-eyebrow">Keep reading</p><h2 className="type-h2 mt-3">Related gifting guides</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <article key={item.slug} className="hanna-card border border-line bg-surface p-6"><p className="type-eyebrow">{item.category}</p><h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy-950"><Link href={`/blog/${item.slug}`}>{item.title}</Link></h3><Link className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy-950" href={`/blog/${item.slug}`}>Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link></article>)}</div>
            </Container>
          </section>
        ) : null}
      </main>
    </>
  );
}
