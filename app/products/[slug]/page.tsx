import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, PackageCheck, ShieldCheck, Star } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getProductBySlug, searchProducts } from "@/lib/data/products";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY } from "@/lib/config/store";
import { DELIVERY_WINDOW } from "@/lib/services/delivery";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product | Gifta Guru" };

  return {
    title: `${product.name} | Gifta Guru`,
    description: product.description ?? "Premium corporate gifting product by Gifta Guru.",
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cardProduct: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.categorySlug ?? "corporate-gifts",
    description: product.description ?? "",
    price: product.basePrice,
    minQuantity: MIN_ORDER_QUANTITY,
    featured: true,
    image: product.images[0]?.url,
    inStock: product.variants.some((variant) => variant.inStock),
  };
  const related = await searchProducts({ categorySlug: product.categorySlug ?? undefined, limit: 4 });

  return (
    <>
      <Container className="py-8 sm:py-12">
        <nav className="flex flex-wrap gap-2 text-sm text-ink-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy-950">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-navy-950">Shop</Link>
          <span>/</span>
          <span className="text-navy-950">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <section>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
              {product.categoryName ?? "Corporate Gifts"}
            </p>
            <h1 className="mt-3 font-display text-4xl text-navy-950 sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-700">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                {product.avgRating || 4.8} ({product.reviewCount || 24} reviews)
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                In stock for bulk orders
              </span>
            </div>
            <p className="mt-5 text-lg leading-8 text-ink-700">{product.description}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-navy-950">{formatPrice(product.basePrice)}</span>
              {product.compareAtPrice ? (
                <span className="pb-1 text-lg text-ink-500 line-through">{formatPrice(product.compareAtPrice)}</span>
              ) : null}
              <span className="pb-1 text-sm text-ink-500">excl. GST</span>
            </div>

            <div className="mt-8 rounded-2xl bg-cream-200 p-5">
              <h2 className="font-display text-2xl text-navy-950">Customize for your company</h2>
              <p className="mt-2 text-sm text-ink-700">
                Upload logo artwork, add personalization text, choose wrap preferences, and request branding proof before production.
              </p>
            </div>

            <div className="mt-8">
              <ProductPurchasePanel product={cardProduct} />
            </div>
          </section>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            { title: "Estimated delivery", copy: DELIVERY_WINDOW, Icon: Clock },
            { title: "Secure fulfillment", copy: "Server-side pricing and payment verification architecture", Icon: ShieldCheck },
            { title: "Bulk support", copy: "Dedicated assistance for custom quantities and packaging", Icon: PackageCheck },
          ].map(({ title, copy, Icon }) => (
            <div key={title} className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
              <Icon className="h-5 w-5 text-gold-600" />
              <h2 className="mt-4 font-display text-xl text-navy-950">{title}</h2>
              <p className="mt-2 text-sm text-ink-700">{copy}</p>
            </div>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="font-display text-3xl text-navy-950">Product Details</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
              <h3 className="font-semibold text-navy-950">Specifications</h3>
              <dl className="mt-4 grid gap-3 text-sm text-ink-700">
                <div className="flex justify-between gap-4"><dt>Minimum quantity</dt><dd>{MIN_ORDER_QUANTITY} units</dd></div>
                <div className="flex justify-between gap-4"><dt>Customization</dt><dd>{product.isCustomizable ? "Available" : "Not available"}</dd></div>
                <div className="flex justify-between gap-4"><dt>Gift wrap</dt><dd>{formatPrice(GIFT_WRAP_PRICE)}</dd></div>
                <div className="flex justify-between gap-4"><dt>Logo proof</dt><dd>Shared before production</dd></div>
              </dl>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5">
              <h3 className="font-semibold text-navy-950">Customization Options</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink-700">
                <li>Company logo embossing or print where applicable</li>
                <li>Personalization text up to 10 characters</li>
                <li>Gift wrap and branded presentation boxes</li>
                <li>Bulk quote support for high-volume orders</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl text-navy-950">Related Products</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.filter((item) => item.slug !== product.slug).slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-950/10 bg-cream-100/95 p-3 backdrop-blur lg:hidden">
        <AddToCartButton product={cardProduct} className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100" />
      </div>
    </>
  );
}
