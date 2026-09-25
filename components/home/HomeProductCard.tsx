import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";

/**
 * Editorial product card used by the homepage and campaign landing pages.
 * Product data, destination and imagery stay live; only its presentation is
 * shared so seasonal sections do not drift away from the homepage design.
 */
export default function HomeProductCard({ product }: { product: Product }) {
  return (
    <article>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[3px] border border-line bg-surface">
          <Image
            src={product.image ?? "/BANNERS/PREMIUM.png"}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
            className="object-contain p-5 transition-opacity duration-200 group-hover:opacity-85"
          />
        </div>
        <p className="type-meta mt-4">{product.category.replaceAll("-", " ")} · MOQ {product.minQuantity}</p>
        <h3 className="mt-2 font-display text-xl text-navy-950">{product.name}</h3>
      </Link>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="type-meta">Branding available</span>
        <Link
          href={`/products/${product.slug}`}
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy-950"
        >
          <span className="link-underline">View product</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
