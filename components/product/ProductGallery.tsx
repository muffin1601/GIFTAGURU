"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  // Order is set by the admin (sortOrder asc), so index 0 is the primary image.
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    // Previously fell back to /images/premium-gifts.png, which does not exist
    // and rendered as a broken image.
    return (
      <div className="flex aspect-square items-center justify-center rounded-[30px] border border-line bg-sunken">
        <span className="type-meta">Image coming soon</span>
      </div>
    );
  }

  const active = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[30px] border border-line bg-surface shadow-[0_10px_40px_-5px_rgba(10,26,48,0.1)]">
        <Image
          src={active.url}
          alt={active.alt ?? name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8 sm:p-12"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={isActive}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-[15px] border bg-surface transition-colors duration-200",
                  isActive ? "border-navy-950" : "border-line hover:border-line-strong",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-contain p-2.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
