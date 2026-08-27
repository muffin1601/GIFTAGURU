import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl shadow-sm ring-1 ring-navy-950/5 transition-shadow duration-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={category.image}
          alt={category.tagline}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <span className="absolute bottom-4 right-4 inline-flex translate-y-2 items-center gap-1 rounded-full bg-cream-100/95 px-4 py-2 text-sm font-semibold text-navy-950 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        View Collection
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
