import Link from "next/link";
import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import { createCategoryAction } from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Categories</h1>
        <p className="mt-2 text-sm text-ink-600">
          Categories classify products for filtering and reporting. Storefront collections (the
          curated pages customers browse) are managed separately under Collections.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">New category</h2>
        <ActionForm
          action={createCategoryAction}
          submitLabel="Create category"
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Name
            <AdminInput name="name" required placeholder="e.g. Office & Stationery" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Slug (optional, auto-generated from name)
            <AdminInput name="slug" placeholder="office-stationery" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Description
            <AdminTextarea name="description" rows={2} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Image URL
            <AdminInput name="imageUrl" placeholder="/SBanners/..." />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Display order
            <AdminInput name="sortOrder" type="number" min={0} defaultValue={categories.length} />
          </label>
        </ActionForm>
      </section>

      {categories.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-600">No categories yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/admin/categories/${category.id}`}
              className="panel block p-5 transition-colors duration-200 hover:border-line-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl text-navy-950">{category.name}</h2>
                {!category.isActive ? <span className="badge badge-attention shrink-0">Archived</span> : null}
              </div>
              <p className="mt-1 text-sm text-ink-600">{category.slug}</p>
              <p className="mt-3 line-clamp-2 text-sm text-ink-700">{category.description ?? "No description"}</p>
              <p className="mt-3 text-sm font-semibold text-navy-950">{category._count.products} products</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
