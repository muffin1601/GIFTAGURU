import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageView from "@/components/seo/LandingPageView";
import { pageMetadata } from "@/lib/seo/metadata";
import { useCasePages } from "@/lib/seo/content/use-cases";

const bySlug = new Map(useCasePages.map((page) => [page.slug, page]));

export function generateStaticParams() {
  return useCasePages.map((page) => ({ slug: page.slug }));
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
      title: "Gifting solution not found | Gifta Guru",
      description: "This page is not available.",
      path: `/gifting/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${content.seoTitle} | Gifta Guru`,
    description: content.metaDescription,
    path: `/gifting/${content.slug}`,
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

  return <LandingPageView family="gifting" content={content} />;
}
