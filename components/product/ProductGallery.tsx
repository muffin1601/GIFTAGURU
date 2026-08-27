"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const usableImages = images.length > 0 ? images : [{ url: "/images/premium-gifts.png", alt: name }];
  const [active, setActive] = useState(usableImages[0]);

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-navy-950/5">
        <Image
          src={active.url}
          alt={active.alt ?? name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8 transition-transform duration-300 hover:scale-110"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {usableImages.map((image) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setActive(image)}
            className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-navy-950/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
          >
            <Image src={image.url} alt={image.alt ?? name} fill className="object-contain p-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
