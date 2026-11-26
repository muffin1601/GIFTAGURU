import Link from "next/link";
import { Plus } from "lucide-react";
import ProductGrid from "@/components/admin/product-grid/ProductGrid";
import { requireAdmin } from "@/lib/auth/admin";
import { roleCan } from "@/lib/auth/permissions";
import { getProductGridPage } from "@/lib/admin/products/query";

export const metadata = { title: "Products | Gifta Guru Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const admin = await requireAdmin();
  const data = await getProductGridPage(params);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-navy-950">Products</h1>
          <p className="mt-1 text-sm text-ink-600">
            Edit products directly in the table, paste from Excel, then click <strong>Save All Changes</strong>. Nothing is saved until you do.
          </p>
        </div>
        {roleCan(admin.role, "products.edit") ? (
          <Link href="/admin/products/new" className="btn btn-primary py-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add product
          </Link>
        ) : null}
      </div>

      <ProductGrid
        rows={data.rows}
        categories={data.categories}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        sort={data.sort}
        filters={data.filters}
        initialEdit={params.edit === "1"}
        permissions={{
          edit: roleCan(admin.role, "products.edit"),
          bulk: roleCan(admin.role, "products.bulk"),
          delete: roleCan(admin.role, "products.delete"),
          export: roleCan(admin.role, "products.export"),
        }}
      />
    </div>
  );
}
