import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import { createProductAction } from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">New product</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          Products start as drafts and never appear on the storefront until you publish them.
          After creating it you can upload images, assign collections and configure quantity
          pricing.
        </p>
      </div>

      <section className="panel max-w-3xl p-5">
        <ActionForm action={createProductAction} submitLabel="Create draft product" className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Product name
            <AdminInput name="name" required placeholder="e.g. Grey Planner Corporate Set" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Slug (optional, auto-generated)
            <AdminInput name="slug" placeholder="grey-planner-corporate-set" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Category
            <select name="categoryId" className="field-input text-sm">
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Description
            <AdminTextarea name="description" rows={3} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Base price (INR)
            <AdminInput name="basePrice" type="number" min={0} step="0.01" required />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Compare-at price (optional)
            <AdminInput name="compareAtPrice" type="number" min={0} step="0.01" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Minimum order quantity
            <AdminInput name="minOrderQuantity" type="number" min={1} defaultValue={5} required />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isCustomizable" value="true" defaultChecked className="h-4 w-4 accent-navy-950" />
            Customization available
          </label>
        </ActionForm>
      </section>
    </div>
  );
}
