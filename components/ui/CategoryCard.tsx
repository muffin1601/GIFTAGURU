import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden border border-line bg-sunken">
        <Image
          src={category.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </div>

      <div className="flex items-start justify-between gap-6 pt-5">
        <div>
          <h3 className="font-display text-xl text-navy-950">{category.name}</h3>
          <p className="type-body mt-1.5 max-w-sm">{category.tagline}</p>
        </div>
        {/* The arrow shifts a few pixels on hover -- no scale, no shadow. */}
        <ArrowRight
          className="mt-1.5 h-4 w-4 shrink-0 text-navy-950 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true" strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}
