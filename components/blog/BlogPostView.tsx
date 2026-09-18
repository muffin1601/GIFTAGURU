import Image from "next/image";
import Link from "next/link";
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
  return <>
    <JsonLd data={[
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path }]),
      blogPostingSchema({ ...post, path }),
      faqPageSchema(post.faqs),
    ]} />
    <section className="border-b border-line">
      <Container className="pb-12 pt-6 sm:pb-16 sm:pt-8">
        <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Blog</Link><span aria-hidden="true">/</span><span className="text-navy-950">{post.title}</span></nav>
        <div className="mt-8 max-w-4xl"><span className="type-eyebrow">{post.category}</span><h1 className="type-h1 mt-4">{post.title}</h1><p className="type-lead mt-5">{post.excerpt}</p><p className="type-meta mt-6">{post.authorName ? `${post.authorName} · ` : ""}<time dateTime={post.publishedAt.toISOString()}>{dateFormat.format(post.publishedAt)}</time>{post.updatedAt.getTime() > post.publishedAt.getTime() ? <> · Updated <time dateTime={post.updatedAt.toISOString()}>{dateFormat.format(post.updatedAt)}</time></> : null}</p></div>
        <div className="relative mt-10 aspect-[16/7] overflow-hidden border border-line bg-surface"><Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill priority sizes="(min-width: 1024px) 80vw, 100vw" className="object-cover" /></div>
      </Container>
    </section>
    <Container className="py-14 sm:py-16"><div className="max-w-3xl space-y-12">
      {post.sections.map((section) => <section key={section.heading}><h2 className="type-h2">{section.heading}</h2>{section.body?.map((paragraph) => <p key={paragraph} className="type-body mt-4">{paragraph}</p>)}{section.bullets?.length ? <ul className="mt-4 space-y-2">{section.bullets.map((bullet) => <li key={bullet} className="type-body flex gap-3"><span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600" />{bullet}</li>)}</ul> : null}</section>)}
    </div>
    <section className="mt-16 border-y border-line bg-surface px-5 py-8 sm:px-8"><h2 className="type-h2">Plan your corporate gifting brief</h2><p className="type-body mt-3 max-w-2xl">Tell our team your audience, quantity and branding requirements to get a relevant shortlist.</p><Button href="/bulk-enquiry" variant="primary" className="mt-6">Request a Custom Quote</Button></section>
    {products.length ? <section className="mt-16"><h2 className="type-h2">Relevant gift sets</h2><div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section> : null}
    {post.faqs.length ? <section className="mt-16 border-t border-line pt-10"><h2 className="type-h2">Frequently asked questions</h2><dl className="mt-8 max-w-3xl space-y-8">{post.faqs.map((faq) => <div key={faq.question}><dt className="font-display text-lg text-navy-950">{faq.question}</dt><dd className="type-body mt-2">{faq.answer}</dd></div>)}</dl></section> : null}
    <section className="mt-16 border-t border-line pt-10"><h2 className="type-h2">Continue exploring</h2><ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">{post.relatedLinks.map((link) => <li key={link.href}><Link href={link.href} className="link-underline text-navy-950">{link.label}</Link></li>)}</ul></section>
    {related.length ? <section className="mt-16 border-t border-line pt-10"><h2 className="type-h2">Related guides</h2><div className="mt-7 grid gap-6 md:grid-cols-3">{related.map((item) => <article key={item.slug} className="border-t border-line pt-4"><p className="type-meta">{item.category}</p><h3 className="mt-2 font-display text-xl text-navy-950"><Link href={`/blog/${item.slug}`}>{item.title}</Link></h3><Link className="link-underline type-meta mt-4 inline-block" href={`/blog/${item.slug}`}>Read More</Link></article>)}</div></section> : null}
    </Container>
  </>;
}
