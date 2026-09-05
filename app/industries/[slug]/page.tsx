import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageView from "@/components/seo/LandingPageView";
import { pageMetadata } from "@/lib/seo/metadata";
import { industryPages } from "@/lib/seo/content/industries";

const bySlug = new Map(industryPages.map((page) => [page.slug, page]));

/** Only the nine industries with a justified page exist as routes; anything
 * else 404s rather than rendering an empty templated shell. */
export function generateStaticParams() {
  return industryPages.map((page) => ({ slug: page.slug }));
}

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
      title: "Industry not found | Gifta Guru",
      description: "This industry page is not available.",
      path: `/industries/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${content.seoTitle} | Gifta Guru`,
    description: content.metaDescription,
    path: `/industries/${content.slug}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = bySlug.get(slug);
  if (!content) notFound();

  return <LandingPageView family="industries" content={content} />;
}
