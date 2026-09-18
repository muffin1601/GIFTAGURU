import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostView from "@/components/blog/BlogPostView";
import { getPublishedBlogPost, getPublishedBlogPosts } from "@/lib/blog/data";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return pageMetadata({ title: "Article not found | Gifta Guru", description: "This article is not available.", path: `/blog/${slug}`, index: false });
  const metadata = pageMetadata({ title: `${post.seoTitle} | Gifta Guru`, description: post.metaDescription, path: `/blog/${post.slug}`, image: post.ogImageUrl ?? post.featuredImageUrl, imageAlt: post.featuredImageAlt, type: "article" });
  // Editors may retain an explicitly approved canonical during a migration;
  // otherwise every article canonicals to its own stable slug URL.
  if (post.canonicalUrl) metadata.alternates = { canonical: post.canonicalUrl };
  if (metadata.openGraph) { metadata.openGraph.title = post.ogTitle ?? metadata.openGraph.title; metadata.openGraph.description = post.ogDescription ?? metadata.openGraph.description; }
  return metadata;
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPublishedBlogPost(slug), getPublishedBlogPosts()]);
  if (!post) notFound();
  const related = allPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);
  return <BlogPostView post={post} related={related} />;
}
