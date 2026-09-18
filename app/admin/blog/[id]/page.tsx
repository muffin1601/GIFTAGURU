import { notFound } from "next/navigation";
import ActionForm from "@/components/admin/ActionForm";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { deleteBlogPostAction } from "@/lib/actions/blog";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPostPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const post = await prisma.blogPost.findUnique({ where: { id } }); if (!post) notFound(); return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Content</p><h1 className="mt-2 font-display text-4xl text-navy-950">Edit blog post</h1></div><section className="panel p-5"><BlogPostForm post={post} /></section><ActionForm action={deleteBlogPostAction} submitLabel="Delete post" confirmMessage="Delete this post? This cannot be undone." className="border-t border-line pt-4"><input type="hidden" name="id" value={post.id} /></ActionForm></div>; }
