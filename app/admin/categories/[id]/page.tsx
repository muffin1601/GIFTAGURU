import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import {
  deleteCategoryAction,
  setCategoryActiveAction,
  updateCategoryAction,
} from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } }, products: { select: { id: true, name: true }, take: 20 } },
  });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm font-semibold text-gold-700">
          &larr; Categories
        </Link>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{category.name}</h1>
        {!category.isActive ? <span className="badge badge-attention mt-2 inline-flex">Archived</span> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-navy-950">Edit category</h2>
          <ActionForm action={updateCategoryAction} submitLabel="Save changes" className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={category.id} />
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Name
              <AdminInput name="name" required defaultValue={category.name} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Slug
              <AdminInput name="slug" defaultValue={category.slug} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
              Description
              <AdminTextarea name="description" rows={3} defaultValue={category.description ?? ""} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Image URL
              <AdminInput name="imageUrl" defaultValue={category.imageUrl ?? ""} />
            </label>
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Display order
              <AdminInput name="sortOrder" type="number" min={0} defaultValue={category.sortOrder} />
            </label>
          </ActionForm>
        </section>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="font-display text-lg text-navy-950">Status</h2>
            <p className="mt-2 text-sm text-ink-600">
              Archiving hides this category from new-product assignment without deleting it or
              affecting products that already use it.
            </p>
            <ActionForm
              action={setCategoryActiveAction}
              submitLabel={category.isActive ? "Archive category" : "Restore category"}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="isActive" value={category.isActive ? "false" : "true"} />
            </ActionForm>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-lg text-navy-950">Delete</h2>
            <p className="mt-2 text-sm text-ink-600">
              {category._count.products > 0
                ? `${category._count.products} product(s) use this category. Reassign them before deleting.`
                : "No products use this category -- it can be safely deleted."}
            </p>
            {category._count.products === 0 ? (
              <ActionForm
                action={deleteCategoryAction}
                submitLabel="Delete category"
                confirmMessage={`Delete "${category.name}"? This cannot be undone.`}
                className="mt-4 space-y-3"
              >
                <input type="hidden" name="id" value={category.id} />
              </ActionForm>
            ) : null}
          </section>

          {category.products.length > 0 ? (
            <section className="panel p-5">
              <h2 className="font-display text-lg text-navy-950">Products in this category</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {category.products.map((product) => (
                  <li key={product.id}>
                    <Link href={`/admin/products/${product.id}`} className="text-gold-700 hover:underline">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
