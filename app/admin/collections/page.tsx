import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Collections</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <section key={collection.id} className="panel overflow-x-auto">
            <div className="relative aspect-[4/3] bg-cream-200">
              {collection.imageUrl ? <Image src={collection.imageUrl} alt={collection.name} fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" /> : null}
            </div>
            <div className="p-4">
              <h2 className="font-display text-xl text-navy-950">{collection.name}</h2>
              <p className="mt-1 text-sm text-ink-600">{collection.slug}</p>
              <p className="mt-3 text-sm font-semibold text-navy-950">{collection._count.products} products</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
