import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import { getCategoryBanner, type BannerCategory } from "@/lib/data/category-banner";

/**
 * Banner at the top of a collection page. The image is the one uploaded in
 * Admin → Collections → (collection) → "Category page banner" (or Admin →
 * Banners), falling back to the defaults in lib/data/category-banner.ts.
 * Banner artwork carries its own wording, so it is shown whole with nothing
 * laid over it; the page title and actions sit in a row underneath.
 * When the banner is unpublished only the title row renders.
 */
export default async function CollectionHero({
  category,
  title,
  actions,
}: {
  category: BannerCategory;
  title: string;
  actions?: ReactNode;
}) {
  const banner = await getCategoryBanner(category).catch(() => null);
  const imageUrl = banner?.isPublished ? banner.imageUrl : null;

  return (
    <section className="border-b border-line bg-canvas">
      <Container className="pt-5 pb-8 sm:pt-6 sm:pb-10">
        <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy-950">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/categories" className="hover:text-navy-950">Categories</Link>
          <span aria-hidden="true">/</span>
          <span className="text-navy-950">{category.name}</span>
        </nav>

        {imageUrl ? (
          <div className="relative mt-4 aspect-[2/1] overflow-hidden lg:aspect-[5/2] rounded-2xl border border-line bg-sunken">
            <Image
              src={imageUrl}
              alt={banner?.label || category.name}
              fill
              preload
              sizes="(min-width: 84rem) 78rem, (min-width: 40rem) calc(100vw - 4rem), calc(100vw - 2.5rem)"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 sm:mt-8">
          <div className="max-w-3xl">
            <span className="type-eyebrow">{category.name}</span>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-navy-950 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-4">{actions}</div> : null}
        </div>
      </Container>
    </section>
  );
}
