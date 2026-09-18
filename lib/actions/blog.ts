"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { blogPostFormSchema } from "@/lib/validations/blog";

type State = { error?: string; success?: string };
function values(formData: FormData) { return { ...Object.fromEntries(formData), isFeatured: formData.get("isFeatured") === "true" }; }
function data(input: ReturnType<typeof blogPostFormSchema.parse>) {
  return { ...input, content: input.content as Prisma.InputJsonValue, featuredImageUrl: input.featuredImageUrl || null, featuredImageAlt: input.featuredImageAlt || null, authorName: input.authorName || null, seoTitle: input.seoTitle || null, metaDescription: input.metaDescription || null, canonicalUrl: input.canonicalUrl || null, ogTitle: input.ogTitle || null, ogDescription: input.ogDescription || null, ogImageUrl: input.ogImageUrl || null, focusKeyword: input.focusKeyword || null, publishedAt: input.publishedAt ? new Date(input.publishedAt) : null };
}
function invalidate(slug?: string) { revalidatePath("/blog"); revalidatePath("/sitemap.xml"); revalidatePath("/admin/blog"); if (slug) revalidatePath(`/blog/${slug}`); }

export async function createBlogPostAction(_state: State, formData: FormData): Promise<State> {
  const admin = await requireAdmin(); const parsed = blogPostFormSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid blog post." };
  try { const post = await prisma.blogPost.create({ data: data(parsed.data) }); await logAdminAction(admin, { action: "blog.created", entityType: "blog_post", entityId: post.id, after: post }); invalidate(post.slug); return { success: "Blog post created." }; } catch (error) { return { error: error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "That slug is already in use." : "Could not create the post." }; }
}

export async function updateBlogPostAction(_state: State, formData: FormData): Promise<State> {
  const admin = await requireAdmin(); const id = formData.get("id");
  if (typeof id !== "string" || !zUuid(id)) return { error: "Invalid post." };
  const parsed = blogPostFormSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid blog post." };
  const before = await prisma.blogPost.findUnique({ where: { id } }); if (!before) return { error: "Post not found." };
  try { const post = await prisma.blogPost.update({ where: { id }, data: data(parsed.data) }); await logAdminAction(admin, { action: "blog.updated", entityType: "blog_post", entityId: post.id, before, after: post }); invalidate(before.slug); invalidate(post.slug); return { success: "Blog post saved." }; } catch (error) { return { error: error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "That slug is already in use." : "Could not save the post." }; }
}

export async function deleteBlogPostAction(_state: State, formData: FormData): Promise<State> {
  const admin = await requireAdmin(); const id = formData.get("id"); if (typeof id !== "string" || !zUuid(id)) return { error: "Invalid post." };
  const post = await prisma.blogPost.delete({ where: { id } }).catch(() => null); if (!post) return { error: "Post not found." };
  await logAdminAction(admin, { action: "blog.deleted", entityType: "blog_post", entityId: post.id, before: post }); invalidate(post.slug); return { success: "Blog post deleted." };
}
function zUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
