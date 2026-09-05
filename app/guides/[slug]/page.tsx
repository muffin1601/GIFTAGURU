import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageView from "@/components/seo/LandingPageView";
import { pageMetadata } from "@/lib/seo/metadata";
import { guidePages } from "@/lib/seo/content/guides";

const bySlug = new Map(guidePages.map((page) => [page.slug, page]));

export function generateStaticParams() {
  return guidePages.map((page) => ({ slug: page.slug }));
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
      title: "Guide not found | Gifta Guru",
      description: "This page is not available.",
      path: `/guides/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${content.seoTitle} | Gifta Guru`,
    description: content.metaDescription,
    path: `/guides/${content.slug}`,
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

  return <LandingPageView family="guides" content={content} />;
}
