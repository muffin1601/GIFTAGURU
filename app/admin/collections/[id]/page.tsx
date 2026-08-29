import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import {
  deleteCollectionAction,
  setCollectionPublishedAction,
  toggleCollectionMemberAction,
  updateCollectionAction,
} from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [collection, allProducts] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: { products: { select: { productId: true } } },
    }),
    prisma.product.findMany({
      where: { status: { not: "archived" } },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!collection) notFound();

  const memberIds = new Set(collection.products.map((p) => p.productId));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/collections" className="text-sm font-semibold text-gold-700">
          &larr; Collections
        </Link>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{collection.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-navy-950">Edit collection</h2>
          <ActionForm action={updateCollectionAction} submitLabel="Save changes" className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={collection.id} />
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Name
              <AdminInput name="name" required defaultValue={collection.name} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Slug
              <AdminInput name="slug" defaultValue={collection.slug} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
              Tagline
              <AdminInput name="tagline" defaultValue={collection.tagline ?? ""} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
              Description
              <AdminTextarea name="description" rows={3} defaultValue={collection.description ?? ""} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Image URL
              <AdminInput name="imageUrl" defaultValue={collection.imageUrl ?? ""} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Display order
              <AdminInput name="sortOrder" type="number" min={0} defaultValue={collection.sortOrder} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-navy-950 sm:col-span-2">
              <input
                type="checkbox"
                name="isFeatured"
                value="true"
                defaultChecked={collection.isFeatured}
                className="h-4 w-4 accent-navy-950"
              />
              Feature on homepage
            </label>
          </ActionForm>
        </section>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="font-display text-lg text-navy-950">Publish</h2>
            <p className="mt-2 text-sm text-ink-600">
              {collection.isPublished
                ? "Live -- visible at /categories and its own page."
                : "Hidden from the storefront."}
            </p>
            <ActionForm
              action={setCollectionPublishedAction}
              submitLabel={collection.isPublished ? "Unpublish" : "Publish"}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="id" value={collection.id} />
              <input type="hidden" name="isPublished" value={collection.isPublished ? "false" : "true"} />
            </ActionForm>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-lg text-navy-950">Delete</h2>
            <p className="mt-2 text-sm text-ink-600">
              {memberIds.size > 0
                ? `${memberIds.size} product(s) are assigned. Remove them below before deleting.`
                : "No products assigned -- this collection can be safely deleted."}
            </p>
            {memberIds.size === 0 ? (
              <ActionForm
                action={deleteCollectionAction}
                submitLabel="Delete collection"
                confirmMessage={`Delete "${collection.name}"? This cannot be undone.`}
                className="mt-4 space-y-3"
              >
                <input type="hidden" name="id" value={collection.id} />
              </ActionForm>
            ) : null}
          </section>
        </aside>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">
          Products in this collection ({memberIds.size})
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Toggle a product to add or remove it. Changes apply immediately on the storefront.
        </p>
        <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {allProducts.map((product) => {
            const isMember = memberIds.has(product.id);
            return (
              <form key={product.id} action={async (formData: FormData) => { "use server"; await toggleCollectionMemberAction({}, formData); }}>
                <input type="hidden" name="collectionId" value={collection.id} />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="member" value={isMember ? "false" : "true"} />
                <button
                  type="submit"
                  className={`flex w-full items-center gap-2.5 border-b border-line py-2 text-left text-sm transition-colors duration-200 hover:text-navy-950 ${
                    isMember ? "text-navy-950" : "text-ink-500"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                      isMember ? "border-navy-950 bg-navy-950" : "border-line-strong"
                    }`}
                    aria-hidden="true"
                  >
                    {isMember ? <span className="h-1.5 w-1.5 bg-cream-100" /> : null}
                  </span>
                  {product.name}
                  {product.status !== "active" ? (
                    <span className="type-meta">({product.status})</span>
                  ) : null}
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
