import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, PackageCheck, ShieldCheck, Star } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import WishlistButton from "@/components/product/WishlistButton";
import { isProductWishlisted } from "@/lib/wishlist/queries";
import ProductDetailAccordion from "@/components/product/ProductDetailAccordion";
import AddToCartButton from "@/components/cart/AddToCartButton";
import JsonLd from "@/components/seo/JsonLd";
import { getProductBySlug, searchProducts } from "@/lib/data/products";
import { PERSONALIZATION_MAX_LENGTH } from "@/lib/config/store";
import { getStoreSettings } from "@/lib/data/store-settings";
import { formatPrice } from "@/lib/utils";
import { pageMetadata, truncateDescription } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import type { Product } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    // A missing product should read as "not found," not silently invite
    // Google to index a placeholder title for a URL that 404s.
    return pageMetadata({
      title: "Product not found | Gifta Guru",
      description: "This product is no longer available.",
      path: `/products/${slug}`,
      index: false,
    });
  }

  const description = truncateDescription(
    product.description || `${product.name}, curated for corporate gifting by Gifta Guru.`,
  );

  return pageMetadata({
    title: `${product.name} | Gifta Guru`,
    description,
    path: `/products/${product.slug}`,
    image: product.images[0]?.url,
    imageAlt: product.images[0]?.alt ?? product.name,
    type: "website",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) notFound();

  const cardProduct: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.categorySlug ?? "corporate-gifts",
    description: product.description ?? "",
    price: product.basePrice,
    minQuantity: settings.minOrderQuantity,
    featured: true,
    image: product.images[0]?.url,
    inStock: product.variants.some((variant) => variant.inStock),
    priceTiers: product.priceTiers,
  };
  const [related, isWishlisted] = await Promise.all([
    searchProducts({ categorySlug: product.categorySlug ?? undefined, limit: 4 }),
    isProductWishlisted(product.id),
  ]);

  const inStock = product.variants.some((variant) => variant.inStock);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
          productSchema({
            name: product.name,
            description: product.description || `${product.name}, curated for corporate gifting by Gifta Guru.`,
            slug: product.slug,
            images: product.images.map((image) => image.url),
            sku: product.variants[0]?.sku,
            price: product.basePrice,
            inStock,
            avgRating: product.avgRating || undefined,
            reviewCount: product.reviewCount,
          }),
        ]}
      />
      <Container className="py-6 pb-28 sm:py-10 lg:pb-16">
        <nav className="type-meta flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy-950">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:text-navy-950">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="text-navy-950">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          {/* Whitespace and hairlines separate the purchase sections -- the
              panel is deliberately not wrapped in one large card. */}
          <section>
            <p className="type-eyebrow">{product.categoryName ?? "Corporate Gifts"}</p>
            <h1 className="type-h1 mt-4">{product.name}</h1>

            {/* Ratings render only when real review data exists. */}
            {product.reviewCount > 0 && product.avgRating ? (
              <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-700">
                <Star className="h-4 w-4 fill-gold-500 text-gold-500" aria-hidden="true" strokeWidth={1.5} />
                {product.avgRating.toFixed(1)} ({product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"})
              </div>
            ) : null}

            <p className="type-lead mt-5">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-8">
              <span className="font-display text-3xl text-navy-950">
                {formatPrice(product.basePrice)}
              </span>
              {product.compareAtPrice ? (
                <span className="text-base text-ink-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
              <span className="type-meta">excl. GST</span>
            </div>

            {product.priceTiers.length > 0 ? (
              <div className="mt-8">
                <h2 className="type-eyebrow">Volume Pricing</h2>
                <table className="mt-4 w-full text-sm">
                  <caption className="sr-only">Price per unit by order quantity</caption>
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th scope="col" className="type-meta pb-2 font-normal">Quantity</th>
                      <th scope="col" className="type-meta pb-2 text-right font-normal">
                        Price per unit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line">
                      <td className="py-3 text-ink-700">
                        1 &ndash; {product.priceTiers[0].minQuantity - 1}
                      </td>
                      <td className="py-3 text-right font-semibold text-navy-950">
                        {formatPrice(product.basePrice)}
                      </td>
                    </tr>
                    {product.priceTiers.map((tier, index) => {
                      const next = product.priceTiers[index + 1];
                      return (
                        <tr key={tier.minQuantity} className="border-b border-line">
                          <td className="py-3 text-ink-700">
                            {tier.minQuantity}
                            {next ? ` – ${next.minQuantity - 1}` : "+"}
                          </td>
                          <td className="py-3 text-right font-semibold text-gold-600">
                            {formatPrice(tier.unitPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="type-meta mt-3">
                  Need a larger quantity?{" "}
                  <Link href="/bulk-enquiry" className="link-underline text-navy-950">
                    Request a quote
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            <div className="mt-10 border-t border-line pt-8">
              <ProductPurchasePanel product={cardProduct} />
              {/* Saved state is resolved server-side so the heart renders
                  correctly on first paint rather than flickering from empty. */}
              <WishlistButton
                productId={cardProduct.id}
                initiallySaved={isWishlisted}
                className="mt-6 border-t border-line pt-6"
              />
            </div>
          </section>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-8 border-t border-line pt-10 sm:grid-cols-3">
          {[
            { title: "Estimated delivery", copy: settings.shippingTimeline, Icon: Clock },
            { title: "Secure fulfilment", copy: "Server-side pricing and payment verification.", Icon: ShieldCheck },
            { title: "Bulk support", copy: "Dedicated assistance for custom quantities and packaging.", Icon: PackageCheck },
          ].map(({ title, copy, Icon }) => (
            <div key={title}>
              <Icon className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
              <h2 className="mt-3 font-display text-lg text-navy-950">{title}</h2>
              <p className="type-body mt-1.5">{copy}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Product details</h2>
          <div className="mt-8 max-w-3xl">
            <ProductDetailAccordion
              sections={[
                {
                  id: "specifications",
                  title: "Specifications",
                  content: (
                    <dl className="grid gap-x-12 sm:grid-cols-2">
                      {[
                        ["Minimum quantity", `${settings.minOrderQuantity} units`],
                        ["Customization", product.isCustomizable ? "Available" : "Not available"],
                        ["Gift wrap", formatPrice(settings.giftWrapPrice)],
                        ["Logo proof", "Shared before production"],
                      ].map(([term, value]) => (
                        <div
                          key={term}
                          className="flex justify-between gap-6 border-b border-line py-2.5"
                        >
                          <dt>{term}</dt>
                          <dd className="text-right font-medium text-navy-950">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                },
                {
                  id: "customization",
                  title: "What's Included & Customization",
                  content: (
                    <ul className="space-y-3">
                      <li>Company logo embossing or print where applicable</li>
                      <li>Personalization text up to {PERSONALIZATION_MAX_LENGTH} characters</li>
                      <li>Gift wrap and branded presentation boxes</li>
                      <li>Bulk quote support for high-volume orders</li>
                    </ul>
                  ),
                },
                {
                  id: "shipping",
                  title: "Shipping & Returns",
                  content: (
                    <div className="space-y-3">
                      <p>{settings.shippingTimeline}. Final shipping charges are calculated securely at checkout based on your delivery address and order size.</p>
                      <p>Customized and personalized orders are made to your specification and are not eligible for return once production has started. Contact our team before placing a bulk order if you have questions.</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="type-h2">Related products</h2>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.filter((item) => item.slug !== product.slug).slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </Container>

      {/* Sticky mobile purchase bar. The page adds matching bottom padding so
          it never covers the last section. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas px-4 py-3 lg:hidden">
        <AddToCartButton product={cardProduct} className="btn btn-primary w-full" />
      </div>
    </>
  );
}
