import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import { getCategoryBanner, type BannerCategory } from "@/lib/data/category-banner";

/**
 * Single banner at the top of a collection page. The image is the one
 * uploaded in Admin → Collections → (collection) → "Category page banner"
 * (or Admin → Banners). The title sits on a soft fade over the left side, so
 * uploads read best with a calm left ~40% and the subject on the right.
 * When the banner is unpublished the hero renders as text only.
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

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-sunken">
          {imageUrl ? (
            <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:absolute lg:inset-0 lg:aspect-auto">
              <Image
                src={imageUrl}
                alt={banner?.label || category.name}
                fill
                preload
                sizes="(min-width: 84rem) 78rem, 100vw"
                className="object-cover object-right"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 hidden bg-gradient-to-r from-canvas from-25% via-canvas/75 via-45% to-transparent to-65% lg:block"
              />
            </div>
          ) : null}

          <div
            className={`relative px-6 py-8 sm:px-10 sm:py-10 ${
              imageUrl ? "lg:flex lg:min-h-[26rem] lg:max-w-[46%] lg:flex-col lg:justify-center lg:px-14" : "lg:px-14 lg:py-14"
            }`}
          >
            <span className="type-eyebrow">{category.name}</span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-950 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
