import Image from "next/image";
import { notFound } from "next/navigation";
import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { addPriceTierAction, deletePriceTierAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { include: { inventory: true }, orderBy: { createdAt: "asc" } },
      priceTiers: { orderBy: { minQuantity: "asc" } },
    },
  });
  if (!product) notFound();

  const cover = product.images[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{product.name}</h1>
        <p className="mt-1 text-sm text-ink-600">{product.slug} &middot; {product.category?.name ?? "Uncategorized"}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-2xl text-navy-950">Images</h2>
            <p className="mt-1 text-sm text-ink-600">Position 1 is the primary storefront image. Order is set by sort order in the database.</p>
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {product.images.map((image, index) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-cream-200 ring-1 ring-navy-950/10">
                  <Image src={image.url} alt={image.altText ?? product.name} fill sizes="120px" className="object-contain p-2" />
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded-full bg-navy-950 px-2 py-0.5 text-[10px] font-semibold text-cream-100">Primary</span>
                  ) : null}
                </div>
              ))}
              {product.images.length === 0 ? <p className="text-sm text-ink-500">No images uploaded.</p> : null}
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-2xl text-navy-950">Quantity pricing</h2>
            <p className="mt-1 text-sm text-ink-600">
              Base price {formatPrice(Number(product.basePrice))} applies below the first tier. Cart and checkout always
              recalculate the price server-side from these tiers &mdash; the storefront cannot override it.
            </p>

            <div className="mt-4 divide-y divide-navy-950/10 rounded-lg border border-navy-950/10">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span>1 &ndash; {product.priceTiers[0]?.minQuantity ? product.priceTiers[0].minQuantity - 1 : "&infin;"}</span>
                <span className="font-semibold text-navy-950">{formatPrice(Number(product.basePrice))} (base)</span>
              </div>
              {product.priceTiers.map((tier, index) => {
                const next = product.priceTiers[index + 1];
                return (
                  <div key={tier.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span>{tier.minQuantity}{next ? ` – ${next.minQuantity - 1}` : "+"}</span>
                    <span className="font-semibold text-navy-950">{formatPrice(Number(tier.unitPrice))}</span>
                    <ActionForm action={deletePriceTierAction} submitLabel="Remove" className="inline">
                      <input type="hidden" name="tierId" value={tier.id} />
                      <input type="hidden" name="productId" value={product.id} />
                    </ActionForm>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-navy-950/10 pt-5">
              <h3 className="text-sm font-semibold text-navy-950">Add / update a tier</h3>
              <ActionForm action={addPriceTierAction} submitLabel="Save tier" className="mt-3 grid gap-3 sm:grid-cols-3 sm:items-end">
                <input type="hidden" name="productId" value={product.id} />
                <label className="text-xs font-semibold text-ink-600 sm:col-span-1">
                  Min quantity
                  <AdminInput name="minQuantity" type="number" min={1} required className="mt-1" />
                </label>
                <label className="text-xs font-semibold text-ink-600 sm:col-span-1">
                  Unit price (INR)
                  <AdminInput name="unitPrice" type="number" min={0} step="0.01" required className="mt-1" />
                </label>
              </ActionForm>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-xl text-navy-950">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Status" value={product.status} />
              <Row label="Base price" value={formatPrice(Number(product.basePrice))} />
              <Row label="Min order quantity" value={String(product.minOrderQuantity)} />
              <Row label="Customizable" value={product.isCustomizable ? "Yes" : "No"} />
            </dl>
          </section>

          <section className="rounded-lg bg-white p-5 ring-1 ring-navy-950/5">
            <h2 className="font-display text-xl text-navy-950">Variants &amp; stock</h2>
            <div className="mt-4 space-y-3 text-sm">
              {product.variants.map((variant) => (
                <div key={variant.id} className="rounded-lg border border-navy-950/10 p-3">
                  <p className="font-semibold text-navy-950">{variant.name}</p>
                  <p className="text-ink-600">SKU {variant.sku}</p>
                  <p className="text-ink-600">{variant.inventory?.quantityAvailable ?? 0} in stock</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-navy-950">{value}</dd>
    </div>
  );
}
