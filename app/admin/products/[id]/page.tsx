import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ActionForm";
import {
  addPriceTierAction,
  deletePriceTierAction,
} from "@/lib/actions/admin";
import {
  addProductImageAction,
  deleteProductImageAction,
  reorderProductImageAction,
  setProductStatusAction,
  toggleCollectionMemberAction,
  updateProductAction,
} from "@/lib/actions/catalog";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true }, orderBy: { createdAt: "asc" } },
        priceTiers: { orderBy: { minQuantity: "asc" } },
        collections: { select: { collectionId: true } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const memberCollectionIds = new Set(product.collections.map((c) => c.collectionId));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/products" className="text-sm font-semibold text-gold-700">
            &larr; Products
          </Link>
          <h1 className="mt-2 font-display text-4xl text-navy-950">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {product.slug} &middot; {product.category?.name ?? "Uncategorized"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${product.status === "active" ? "badge-positive" : product.status === "draft" ? "badge-attention" : ""}`}>
            {product.status}
          </span>
          <Link href={`/products/${product.slug}`} target="_blank" className="btn btn-secondary py-2 text-xs">
            View on storefront
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* --- Images -------------------------------------------------- */}
          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Images</h2>
            <p className="mt-1 text-sm text-ink-600">
              Position 1 is the primary storefront image. Use the arrows to reorder.
            </p>

            {product.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {product.images.map((image, index) => (
                  <div key={image.id} className="space-y-2">
                    <div className="relative aspect-square overflow-hidden border border-line bg-sunken">
                      <Image src={image.url} alt={image.altText ?? product.name} fill sizes="140px" className="object-contain p-2" />
                      {index === 0 ? (
                        <span className="absolute left-1 top-1 bg-navy-950 px-2 py-0.5 text-[10px] font-semibold text-cream-100">
                          Primary
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <form action={async (formData: FormData) => { "use server"; await reorderProductImageAction({}, formData); }}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={index === 0}
                          aria-label="Move image earlier"
                          className="px-1.5 py-0.5 text-xs text-navy-950 disabled:opacity-30"
                        >
                          &larr;
                        </button>
                      </form>
                      <form action={async (formData: FormData) => { "use server"; await reorderProductImageAction({}, formData); }}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={index === product.images.length - 1}
                          aria-label="Move image later"
                          className="px-1.5 py-0.5 text-xs text-navy-950 disabled:opacity-30"
                        >
                          &rarr;
                        </button>
                      </form>
                      <ActionForm
                        action={deleteProductImageAction}
                        submitLabel="Remove"
                        confirmMessage="Remove this image?"
                        className="ml-auto"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                      </ActionForm>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-600">No images uploaded yet.</p>
            )}

            <ActionForm
              action={addProductImageAction}
              submitLabel="Upload image"
              className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4"
            >
              <input type="hidden" name="productId" value={product.id} />
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Add image (PNG, JPG or WEBP, up to 8MB)
                <input type="file" name="file" accept=".png,.jpg,.jpeg,.webp" required className="field-input text-sm" />
              </label>
            </ActionForm>
          </section>

          {/* --- Core fields ---------------------------------------------- */}
          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Details</h2>
            <ActionForm action={updateProductAction} submitLabel="Save changes" className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={product.id} />
              <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
                Name
                <AdminInput name="name" required defaultValue={product.name} />
              </label>
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Slug
                <AdminInput name="slug" defaultValue={product.slug} />
              </label>
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Category
                <select name="categoryId" defaultValue={product.categoryId ?? ""} className="field-input text-sm">
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
                <AdminTextarea name="description" rows={4} defaultValue={product.description ?? ""} />
              </label>
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Base price (INR)
                <AdminInput name="basePrice" type="number" min={0} step="0.01" required defaultValue={Number(product.basePrice)} />
              </label>
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Compare-at price
                <AdminInput
                  name="compareAtPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={product.compareAtPrice ? Number(product.compareAtPrice) : undefined}
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-navy-950">
                Minimum order quantity
                <AdminInput name="minOrderQuantity" type="number" min={1} required defaultValue={product.minOrderQuantity} />
              </label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                  <input type="checkbox" name="isCustomizable" value="true" defaultChecked={product.isCustomizable} className="h-4 w-4 accent-navy-950" />
                  Customizable
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                  <input type="checkbox" name="isFeatured" value="true" defaultChecked={product.isFeatured} className="h-4 w-4 accent-navy-950" />
                  Featured
                </label>
              </div>
            </ActionForm>
          </section>

          {/* --- Collections ------------------------------------------------ */}
          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Collections</h2>
            <p className="mt-1 text-sm text-ink-600">Assign this product to the storefront collections it should appear in.</p>
            <div className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {collections.map((collection) => {
                const isMember = memberCollectionIds.has(collection.id);
                return (
                  <form key={collection.id} action={async (formData: FormData) => { "use server"; await toggleCollectionMemberAction({}, formData); }}>
                    <input type="hidden" name="collectionId" value={collection.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="member" value={isMember ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`flex w-full items-center gap-2.5 border-b border-line py-2 text-left text-sm transition-colors duration-200 hover:text-navy-950 ${
                        isMember ? "text-navy-950" : "text-ink-500"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                          isMember ? "border-navy-950 bg-navy-950" : "border-line-strong"
                        }`}
                        aria-hidden="true"
                      >
                        {isMember ? <span className="h-1.5 w-1.5 bg-cream-100" /> : null}
                      </span>
                      {collection.name}
                    </button>
                  </form>
                );
              })}
            </div>
          </section>

          {/* --- Quantity pricing -------------------------------------- */}
          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Quantity pricing</h2>
            <p className="mt-1 text-sm text-ink-600">
              Base price {formatPrice(Number(product.basePrice))} applies below the first tier. Cart and checkout always
              recalculate the price server-side from these tiers &mdash; the storefront cannot override it.
            </p>

            <div className="mt-4 divide-y divide-line border border-line">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span>1 &ndash; {product.priceTiers[0]?.minQuantity ? product.priceTiers[0].minQuantity - 1 : "∞"}</span>
                <span className="font-semibold text-navy-950">{formatPrice(Number(product.basePrice))} (base)</span>
              </div>
              {product.priceTiers.map((tier, index) => {
                const next = product.priceTiers[index + 1];
                return (
                  <div key={tier.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span>
                      {tier.minQuantity}
                      {next ? ` – ${next.minQuantity - 1}` : "+"}
                    </span>
                    <span className="font-semibold text-navy-950">{formatPrice(Number(tier.unitPrice))}</span>
                    <ActionForm action={deletePriceTierAction} submitLabel="Remove" className="inline">
                      <input type="hidden" name="tierId" value={tier.id} />
                      <input type="hidden" name="productId" value={product.id} />
                    </ActionForm>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-line pt-5">
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
          <section className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">Publish status</h2>
            <p className="mt-2 text-sm text-ink-600">
              Only <strong>active</strong> products appear on the storefront.
            </p>
            <ActionForm action={setProductStatusAction} submitLabel="Update status" className="mt-4 space-y-3">
              <input type="hidden" name="id" value={product.id} />
              <AdminSelect name="status" defaultValue={product.status} options={["draft", "active", "archived"]} />
            </ActionForm>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">Variants &amp; stock</h2>
            <div className="mt-4 space-y-3 text-sm">
              {product.variants.map((variant) => (
                <div key={variant.id} className="border border-line p-3">
                  <p className="font-semibold text-navy-950">{variant.name}</p>
                  <p className="text-ink-600">SKU {variant.sku}</p>
                  <p className="text-ink-600">{variant.inventory?.quantityAvailable ?? 0} in stock</p>
                </div>
              ))}
            </div>
            <Link href="/admin/inventory" className="mt-3 inline-block text-sm font-semibold text-gold-700">
              Manage stock &rarr;
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
