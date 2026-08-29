import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 30;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" } } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.status ? { status: params.status as "draft" | "active" | "archived" } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        variants: { include: { inventory: true }, orderBy: { createdAt: "asc" } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: params.q, category: params.category, status: params.status, page: params.page, ...overrides };
    Object.entries(merged).forEach(([key, value]) => value && next.set(key, value));
    return `/admin/products${next.toString() ? `?${next}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
          <h1 className="mt-2 font-display text-4xl text-navy-950">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          New product
        </Link>
      </div>

      <form className="panel grid gap-3 p-4 md:grid-cols-[1fr_180px_160px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search product name"
          className="field-input text-sm"
        />
        <select name="category" defaultValue={params.category ?? ""} className="field-input text-sm">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ""} className="field-input text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sunken text-xs uppercase tracking-wide text-ink-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">MOQ</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => {
              const stock = product.variants.reduce((sum, variant) => sum + (variant.inventory?.quantityAvailable ?? 0), 0);
              return (
                <tr key={product.id} className="hover:bg-sunken">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}`} className="font-semibold text-navy-950 hover:text-gold-700">
                      {product.name}
                    </Link>
                    <p className="text-ink-500">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3">{product.category?.name ?? "Uncategorized"}</td>
                  <td className="px-4 py-3">{formatPrice(Number(product.basePrice))}</td>
                  <td className="px-4 py-3">{product.minOrderQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.status === "active" ? "badge-positive" : product.status === "draft" ? "badge-attention" : ""}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.isFeatured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">{stock} units</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-ink-600">
              {params.q || params.category || params.status
                ? "No products match these filters."
                : "No products yet."}
            </p>
            <Link href="/admin/products/new" className="btn btn-secondary mt-4 inline-flex">
              Create your first product
            </Link>
          </div>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-600">
            Page {page} of {totalPages} &middot; {total} products
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={buildHref({ page: String(page - 1) })} className="btn btn-secondary py-2">
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={buildHref({ page: String(page + 1) })} className="btn btn-secondary py-2">
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
