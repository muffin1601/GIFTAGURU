"use client";
/* eslint-disable @next/next/no-img-element */

import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import type { BlogPost } from "@prisma/client";
import { useMemo, useState } from "react";
import { createBlogPostAction, updateBlogPostAction } from "@/lib/actions/blog";

const example = JSON.stringify({ sections: [{ heading: "A useful heading", body: ["A practical paragraph for a business buyer."] }], faqs: [], relatedLinks: [{ label: "Corporate gifting solutions", href: "/corporate-gifting" }], recommendedProductSlugs: [] }, null, 2);

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const document = post ? JSON.stringify(post.content, null, 2) : example;
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [imageUrl, setImageUrl] = useState(post?.featuredImageUrl ?? "");
  const [content, setContent] = useState(document);
  const contentCheck = useMemo(() => {
    try {
      const parsed = JSON.parse(content) as { sections?: unknown[]; faqs?: unknown[]; relatedLinks?: unknown[] };
      const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
      const problems = [
        ...(sections.length === 0 ? ["Add at least one content section."] : []),
        ...sections.flatMap((section) => !section || typeof section !== "object" || !("heading" in section) ? ["Each section needs a heading."] : []),
      ];
      return { valid: problems.length === 0, summary: `${sections.length} sections · ${Array.isArray(parsed.faqs) ? parsed.faqs.length : 0} FAQs · ${Array.isArray(parsed.relatedLinks) ? parsed.relatedLinks.length : 0} internal links`, problems };
    } catch { return { valid: false, summary: "Invalid JSON", problems: ["Fix the JSON syntax before saving."] }; }
  }, [content]);
  return <ActionForm action={action} submitLabel={post ? "Save post" : "Create post"} className="grid gap-4">
    {post ? <input type="hidden" name="id" value={post.id} /> : null}
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium text-navy-950">Title<AdminInput name="title" required defaultValue={post?.title} /></label><label className="space-y-1 text-sm font-medium text-navy-950">Slug<AdminInput name="slug" required defaultValue={post?.slug} placeholder="corporate-gifting-guide" /></label><label className="space-y-1 text-sm font-medium text-navy-950">Category<AdminInput name="category" required defaultValue={post?.category} placeholder="Corporate Gifting" /></label><label className="space-y-1 text-sm font-medium text-navy-950">Author<AdminInput name="authorName" defaultValue={post?.authorName ?? "Gifta Guru Team"} /></label></div>
    <label className="space-y-1 text-sm font-medium text-navy-950">Excerpt<AdminTextarea name="excerpt" required rows={3} defaultValue={post?.excerpt} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium text-navy-950">Featured image URL<AdminInput name="featuredImageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/BANNERS/PREMIUM.png" /></label><label className="space-y-1 text-sm font-medium text-navy-950">Image alt text<AdminInput name="featuredImageAlt" defaultValue={post?.featuredImageAlt ?? ""} /></label><label className="space-y-1 text-sm font-medium text-navy-950">SEO title (max 60)<AdminInput name="seoTitle" defaultValue={post?.seoTitle ?? ""} /></label><label className="space-y-1 text-sm font-medium text-navy-950">Focus keyword<AdminInput name="focusKeyword" defaultValue={post?.focusKeyword ?? ""} /></label></div>
    {imageUrl ? <div className="relative aspect-[16/6] max-w-xl overflow-hidden border border-line bg-surface"><img src={imageUrl} alt="Featured image preview" className="h-full w-full object-cover" /></div> : <p className="text-sm text-ink-600">Add an image path to preview it. Only site assets or approved Supabase Storage URLs are accepted.</p>}
    <label className="space-y-1 text-sm font-medium text-navy-950">Meta description (50–160)<AdminTextarea name="metaDescription" rows={2} defaultValue={post?.metaDescription ?? ""} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium text-navy-950">Canonical URL (optional)<AdminInput name="canonicalUrl" type="url" defaultValue={post?.canonicalUrl ?? ""} placeholder="https://www.giftaguru.com/blog/..." /></label><label className="space-y-1 text-sm font-medium text-navy-950">OG image URL (optional)<AdminInput name="ogImageUrl" defaultValue={post?.ogImageUrl ?? ""} /></label><label className="space-y-1 text-sm font-medium text-navy-950">OG title (optional)<AdminInput name="ogTitle" defaultValue={post?.ogTitle ?? ""} /></label><label className="space-y-1 text-sm font-medium text-navy-950">OG description (optional)<AdminInput name="ogDescription" defaultValue={post?.ogDescription ?? ""} /></label></div>
    <label className="space-y-1 text-sm font-medium text-navy-950">Structured content (JSON)<AdminTextarea name="content" required rows={18} value={content} onChange={(event) => setContent(event.target.value)} /></label><div className={`border p-3 text-sm ${contentCheck.valid ? "border-green-700 bg-green-50 text-green-950" : "border-red-300 bg-red-50 text-red-900"}`}><p className="font-medium">Content check: {contentCheck.summary}</p>{contentCheck.problems.map((problem) => <p key={problem} className="mt-1">{problem}</p>)}</div>
    <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-1 text-sm font-medium text-navy-950">Status<select name="status" defaultValue={post?.status ?? "draft"} className="input"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="space-y-1 text-sm font-medium text-navy-950">Published at (UTC)<AdminInput name="publishedAt" type="datetime-local" defaultValue={post?.publishedAt ? post.publishedAt.toISOString().slice(0, 16) : ""} /></label><label className="flex items-center gap-2 pt-7 text-sm font-medium text-navy-950"><input type="checkbox" name="isFeatured" value="true" defaultChecked={post?.isFeatured} className="h-4 w-4 accent-navy-950" /> Featured</label></div>
  </ActionForm>;
}
