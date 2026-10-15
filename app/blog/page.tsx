import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { blogCategories, getPublishedBlogPosts } from "@/lib/blog/data";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifting Guides & Ideas | Gifta Guru",
  description:
    "Practical corporate gifting guides for HR, procurement, admin and marketing teams planning employee gifts, client gifts, welcome kits and festive programmes.",
  path: "/blog",
});

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const planningSteps = [
  "Define the recipient group and occasion",
  "Set a realistic per-person budget",
  "Confirm branding and packaging needs",
  "Plan one-address or multi-location delivery",
];

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const [featured, ...latest] = posts;
  const categories = blogCategories(posts);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gifting Guides", path: "/blog" }])} />

      <header className="relative overflow-hidden border-b border-navy-800 bg-navy-950 text-cream-100">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold-300/20" aria-hidden="true" />
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-gold-300/20" aria-hidden="true" />
        <Container className="relative grid gap-10 py-16 lg:grid-cols-[1fr_0.38fr] lg:items-end lg:py-24">
          <div>
            <p className="font-script text-lg text-gold-300">The Gifta Guru journal</p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,6.75rem)] font-bold leading-[0.92] tracking-[-0.045em]">
              Better gifting starts with a better brief.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-cream-100/72 sm:text-lg">
              Clear, practical corporate gifting guides for the people planning employee, client, event and festive programmes.
            </p>
          </div>
          <div className="border-l border-cream-100/20 pl-6 lg:pb-2">
            <BookOpen className="h-6 w-6 text-gold-300" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-5 font-display text-4xl text-gold-300">{posts.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60">Expert buying guides</p>
            <Link href="#latest-guides" className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cream-100">
              Browse all guides
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </header>

      <main>
        {categories.length ? (
          <nav className="border-b border-line bg-surface" aria-label="Guide topics">
            <Container className="flex items-center gap-3 overflow-x-auto py-4">
              <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-700">Explore topics</span>
              <span className="h-4 w-px shrink-0 bg-line-strong" aria-hidden="true" />
              {categories.map((category) => (
                <span key={category} className="hanna-pill shrink-0 border border-line-strong px-4 py-2 text-xs font-medium text-navy-950">
                  {category}
                </span>
              ))}
            </Container>
          </nav>
        ) : null}

        {featured ? (
          <section className="bg-cream-200 py-14 sm:py-20" aria-labelledby="featured-guide-heading">
            <Container>
              <article className="hanna-card grid overflow-hidden border border-line bg-surface lg:grid-cols-[1.08fr_0.92fr]">
                <Link href={`/blog/${featured.slug}`} className="group relative min-h-[22rem] overflow-hidden bg-sunken sm:min-h-[30rem]">
                  <Image
                    src={featured.featuredImageUrl}
                    alt={featured.featuredImageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                  <span className="absolute left-5 top-5 bg-gold-400 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-navy-950">
                    Featured guide
                  </span>
                </Link>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <p className="type-eyebrow">{featured.category}</p>
                  <h2 id="featured-guide-heading" className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-navy-950">
                    <Link href={`/blog/${featured.slug}`} className="hover:text-navy-700">{featured.title}</Link>
                  </h2>
                  <p className="type-body mt-5 max-w-xl">{featured.excerpt}</p>
                  <p className="type-meta mt-6">
                    By {featured.authorName ?? "Gifta Guru Team"} <span aria-hidden="true">·</span>{" "}
                    <time dateTime={featured.publishedAt.toISOString()}>{dateFormat.format(featured.publishedAt)}</time>
                  </p>
                  <div className="mt-8">
                    <Button href={`/blog/${featured.slug}`}>Read the featured guide</Button>
                  </div>
                </div>
              </article>
            </Container>
          </section>
        ) : null}

        <section id="latest-guides" className="scroll-mt-40 bg-canvas py-16 sm:py-24" aria-labelledby="latest-guides-heading">
          <Container>
            <div className="grid gap-8 border-b border-navy-950 pb-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="type-eyebrow">Advice for business buyers</p>
                <h2 id="latest-guides-heading" className="mt-3 font-display text-[clamp(2.25rem,5vw,4.25rem)] font-bold leading-none tracking-[-0.035em] text-navy-950">
                  Latest corporate gifting guides
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-ink-600">
                Built for HR, procurement, admin and marketing teams who need useful answers before requesting a quote.
              </p>
            </div>

            {latest.length ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((post, index) => (
                  <article key={post.slug} className="hanna-card group flex min-w-0 flex-col overflow-hidden border border-line bg-surface">
                    <Link href={`/blog/${post.slug}`} className="relative aspect-[4/3] overflow-hidden bg-sunken">
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      />
                      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 font-display text-sm text-navy-950 backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-700">
                        {post.category} <span aria-hidden="true">·</span>{" "}
                        <time dateTime={post.publishedAt.toISOString()}>{dateFormat.format(post.publishedAt)}</time>
                      </p>
                      <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy-950">
                        <Link href={`/blog/${post.slug}`} className="hover:text-navy-700">{post.title}</Link>
                      </h3>
                      <p className="type-body mt-3 line-clamp-3">{post.excerpt}</p>
                      <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.12em] text-navy-950">
                        Read guide
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="type-body mt-8">New corporate gifting guides will appear here shortly.</p>
            )}
          </Container>
        </section>

        <section className="border-y border-line bg-surface">
          <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
            <div>
              <p className="type-eyebrow">Ready to build your brief?</p>
              <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-navy-950">
                Turn the research into a gifting plan.
              </h2>
              <p className="type-body mt-5 max-w-xl">
                Share the essentials and our team will recommend corporate gifts suited to your recipients, budget and brand.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/bulk-enquiry">Request a custom quote</Button>
                <Button href="/shop" variant="secondary">Explore all gifts</Button>
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {planningSteps.map((step, index) => (
                <li key={step} className="flex min-h-28 gap-4 border border-line bg-canvas p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-950 text-cream-100">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium leading-6 text-navy-950"><span className="sr-only">Step {index + 1}: </span>{step}</span>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      </main>
    </>
  );
}
