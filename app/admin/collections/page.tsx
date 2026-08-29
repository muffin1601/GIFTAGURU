import Image from "next/image";
import Link from "next/link";
import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import { createCollectionAction } from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Collections</h1>
        <p className="mt-2 text-sm text-ink-600">
          Collections are the curated, image-led pages customers browse (Eco Gifts, Premium
          Gifts, ...). Feature a collection to show it on the homepage.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">New collection</h2>
        <ActionForm
          action={createCollectionAction}
          submitLabel="Create collection"
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Name
            <AdminInput name="name" required placeholder="e.g. Festive Gifts" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Slug (optional)
            <AdminInput name="slug" placeholder="festive-gifts" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Tagline
            <AdminInput name="tagline" placeholder="Seasonal gifting, done right." />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Image URL
            <AdminInput name="imageUrl" placeholder="/SBanners/..." />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Description
            <AdminTextarea name="description" rows={2} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isFeatured" value="true" className="h-4 w-4 accent-navy-950" />
            Feature on homepage
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Display order
            <AdminInput name="sortOrder" type="number" min={0} defaultValue={collections.length} />
          </label>
        </ActionForm>
      </section>

      {collections.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-600">No collections yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/admin/collections/${collection.id}`}
              className="panel block overflow-hidden transition-colors duration-200 hover:border-line-strong"
            >
              <div className="relative aspect-[4/3] bg-sunken">
                {collection.imageUrl ? (
                  <Image
                    src={collection.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-xl text-navy-950">{collection.name}</h2>
                  {!collection.isPublished ? <span className="badge badge-attention">Unpublished</span> : null}
                  {collection.isFeatured ? <span className="badge badge-positive">Featured</span> : null}
                </div>
                <p className="mt-1 text-sm text-ink-600">{collection.slug}</p>
                <p className="mt-3 text-sm font-semibold text-navy-950">{collection._count.products} products</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
