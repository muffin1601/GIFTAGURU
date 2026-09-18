import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { blogCategories, getPublishedBlogPosts } from "@/lib/blog/data";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Blog | Gifta Guru",
  description: "B2B corporate gifting guides for HR, procurement, admin and marketing teams: employee, client, festive and branded gifting decisions.",
  path: "/blog",
});

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const [featured, ...latest] = posts;
  const categories = blogCategories(posts);
  return <>
    <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
    <section className="border-b border-line"><Container className="pb-14 pt-10 sm:pb-16 sm:pt-14"><span className="type-eyebrow">Business buying guides</span><h1 className="type-h1 mt-4 max-w-4xl">Corporate gifting insights for better business decisions</h1><p className="type-lead mt-5 max-w-3xl">Practical guidance for HR, procurement, admin and marketing teams planning employee, client, event and festive gifting programmes.</p>{categories.length ? <p className="type-meta mt-7">Topics: {categories.join(" · ")}</p> : null}</Container></section>
    <Container className="py-14 sm:py-16">{featured ? <article className="grid overflow-hidden border border-line bg-surface lg:grid-cols-2"><div className="relative aspect-[4/3] lg:aspect-auto"><Image src={featured.featuredImageUrl} alt={featured.featuredImageAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div><div className="flex flex-col justify-center p-7 sm:p-10"><p className="type-eyebrow">Featured · {featured.category}</p><h2 className="mt-4 font-display text-3xl text-navy-950"><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2><p className="type-body mt-4">{featured.excerpt}</p><p className="type-meta mt-5"><time dateTime={featured.publishedAt.toISOString()}>{dateFormat.format(featured.publishedAt)}</time></p><Link href={`/blog/${featured.slug}`} className="link-underline type-meta mt-7 inline-block text-navy-950">Read More</Link></div></article> : null}
      <section className="mt-16"><h2 className="type-h2">Latest articles</h2>{latest.length ? <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{latest.map((post) => <article key={post.slug} className="flex flex-col border-t border-line pt-5"><div className="relative aspect-[4/3] overflow-hidden bg-surface"><Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" /></div><p className="type-meta mt-5">{post.category} · <time dateTime={post.publishedAt.toISOString()}>{dateFormat.format(post.publishedAt)}</time></p><h3 className="mt-3 font-display text-2xl text-navy-950"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p className="type-body mt-3">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="link-underline type-meta mt-5 inline-block text-navy-950">Read More</Link></article>)}</div> : <p className="type-body mt-6">New B2B buying guides will appear here shortly.</p>}</section>
    </Container>
  </>;
}
