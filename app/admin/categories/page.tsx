import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Categories</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <section key={category.id} className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-xl text-navy-950">{category.name}</h2>
            <p className="mt-1 text-sm text-ink-600">{category.slug}</p>
            <p className="mt-3 text-sm text-ink-700">{category.description ?? "No description"}</p>
            <p className="mt-3 text-sm font-semibold text-navy-950">{category._count.products} products</p>
          </section>
        ))}
      </div>
    </div>
  );
}
