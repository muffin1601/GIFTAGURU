import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { updateInventoryAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminInventoryPage() {
  const inventory = await prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
    include: { variant: { include: { product: { select: { name: true, slug: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Inventory</h1>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {inventory.map((item) => {
          const low = item.quantityAvailable <= item.lowStockThreshold;
          return (
            <section key={item.id} className={`rounded-lg bg-white p-5 ring-1 ${low ? "ring-red-200" : "ring-navy-950/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-navy-950">{item.variant.product.name}</h2>
                  <p className="mt-1 text-sm text-ink-600">{item.variant.sku} · {item.variant.name}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {low ? "Low stock" : "In stock"}
                </span>
              </div>
              <ActionForm action={updateInventoryAction} submitLabel="Update stock" className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="inventoryId" value={item.id} />
                <AdminInput name="quantityAvailable" type="number" min={0} defaultValue={item.quantityAvailable} />
                <AdminInput name="lowStockThreshold" type="number" min={0} defaultValue={item.lowStockThreshold} />
                <AdminInput name="reason" placeholder="Reason" className="sm:col-span-2" />
              </ActionForm>
            </section>
          );
        })}
      </div>
    </div>
  );
}
