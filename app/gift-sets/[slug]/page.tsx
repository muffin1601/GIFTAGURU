import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageView from "@/components/seo/LandingPageView";
import { pageMetadata } from "@/lib/seo/metadata";
import { giftSetPages } from "@/lib/seo/content/gift-sets";

const bySlug = new Map(giftSetPages.map((page) => [page.slug, page]));

export function generateStaticParams() {
  return giftSetPages.map((page) => ({ slug: page.slug }));
}

/** Only the curated slugs exist; anything else 404s rather than rendering an
 * empty templated shell that Google could index as thin content. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = bySlug.get(slug);
  if (!content) {
    return pageMetadata({
      title: "Gift set not found | Gifta Guru",
      description: "This page is not available.",
      path: `/gift-sets/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${content.seoTitle} | Gifta Guru`,
    description: content.metaDescription,
    path: `/gift-sets/${content.slug}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = bySlug.get(slug);
  if (!content) notFound();

  return <LandingPageView family="gift-sets" content={content} />;
}
