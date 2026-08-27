import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      variants: { include: { inventory: true }, orderBy: { createdAt: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Products</h1>
      </div>
      <div className="overflow-hidden rounded-lg bg-white ring-1 ring-navy-950/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream-200 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">MOQ</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-950/10">
              {products.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + (variant.inventory?.quantityAvailable ?? 0), 0);
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-950">{product.name}</p>
                      <p className="text-ink-500">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">{product.category?.name ?? "Uncategorized"}</td>
                    <td className="px-4 py-3">{formatPrice(Number(product.basePrice))}</td>
                    <td className="px-4 py-3">{product.minOrderQuantity}</td>
                    <td className="px-4 py-3">{product.status}</td>
                    <td className="px-4 py-3"><Link href="/admin/inventory" className="font-semibold text-gold-700">{stock} units</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-ink-600">Product create/edit/delete should be connected to confirmation-backed forms before destructive production use. Existing products are managed safely as read-first records here.</p>
    </div>
  );
}
