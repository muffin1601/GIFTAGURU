import Link from "next/link";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return <div className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Content</p><h1 className="mt-2 font-display text-4xl text-navy-950">Blog</h1><p className="mt-2 text-sm text-ink-600">Draft, publish and maintain B2B buying guides. Published posts are automatically eligible for the blog and sitemap.</p></div><section className="panel p-5"><h2 className="font-display text-xl text-navy-950">New post</h2><BlogPostForm /></section><section><h2 className="font-display text-2xl text-navy-950">Managed posts</h2><div className="mt-4 grid gap-3">{posts.map((post) => <Link key={post.id} href={`/admin/blog/${post.id}`} className="panel flex items-center justify-between gap-4 p-4"><div><h3 className="font-medium text-navy-950">{post.title}</h3><p className="mt-1 text-sm text-ink-600">/blog/{post.slug}</p></div><span className={`badge ${post.status === "published" ? "badge-positive" : "badge-attention"}`}>{post.status}</span></Link>)}{posts.length === 0 ? <p className="text-sm text-ink-600">No database-managed posts yet. The initial editorial library is bundled from the existing guides.</p> : null}</div></section></div>;
}
