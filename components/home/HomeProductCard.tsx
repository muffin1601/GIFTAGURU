import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

/** Editorial product card backed by the live product record. */
export default function HomeProductCard({ product }: { product: Product }) {
  return (
    <article className="hanna-card border border-line bg-surface p-3 pb-6">
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="hanna-image relative aspect-square border border-line bg-[#eeefec]">
          <Image src={product.image ?? "/BANNERS/PREMIUM.png"} alt={product.name} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-5 transition-opacity duration-200 group-hover:opacity-85" />
        </div>
        <p className="type-meta mt-4 capitalize">{product.category.replaceAll("-", " ")} · MOQ {product.minQuantity}</p>
        <h3 className="mt-2 font-display text-xl text-navy-950">{product.name}</h3>
      </Link>
      <div className="mt-4 flex items-end justify-between gap-3 px-2">
        <div><p className="text-sm font-semibold text-navy-950">{formatPrice(product.price)}</p><span className="type-meta">Branding available</span></div>
        <Link href={`/products/${product.slug}`} className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy-950"><span className="link-underline">View product</span><ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
