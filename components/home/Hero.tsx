"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const slides = [
  {
    eyebrow: "Joining Gifts",
    label: "Welcome",
    title: "Welcome kits that make day one feel considered.",
    description:
      "Curated onboarding gifts with notebooks, pens, desk accessories and custom branding for new hires.",
    image: "/BANNERS/JOINING.png",
    alt: "Joining gift collection by Gifta Guru",
    href: "/categories/joining-gifts",
  },
  {
    eyebrow: "Eco-Friendly Gifts",
    label: "Sustainable",
    title: "Sustainable gifting that still feels premium.",
    description:
      "Eco-conscious gift sets for teams and clients who value useful products and responsible materials.",
    image: "/BANNERS/ECO.png",
    alt: "Eco-friendly corporate gift collection by Gifta Guru",
    href: "/categories/eco-gifts",
  },
  {
    eyebrow: "Premium Gifts",
    label: "Premium",
    title: "Corporate gifts that unbox culture, not clutter.",
    description:
      "Premium gift sets for appreciation, events, client relationships and bulk campaigns across India.",
    image: "/BANNERS/PREMIUM.png",
    alt: "Premium corporate gift sets from Gifta Guru",
    href: "/categories/premium-gifts",
  },
  {
    eyebrow: "Luxury Gifts",
    label: "Executive",
    title: "Executive gifts for high-value business moments.",
    description:
      "Refined luxury sets for leadership, festive gifting and important clients where presentation matters.",
    image: "/BANNERS/LUXURY.png",
    alt: "Luxury corporate gift collection by Gifta Guru",
    href: "/categories/luxury-gifts",
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = slides[activeIndex];

  useEffect(() => {
    // Auto-advance is decoration; honour the OS reduced-motion setting.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || reduced.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="border-b border-line"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Text sits on the page ground, so contrast never depends on an
            overlay sitting on top of photography. */}
        <div className="max-w-xl">
          <span className="type-eyebrow">{active.eyebrow}</span>
          <h1 className="type-h1 mt-5">{active.title}</h1>
          <p className="type-lead mt-6">{active.description}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href={active.href} variant="primary">
              Explore Collection
            </Button>
            <Button href="/bulk-enquiry" variant="secondary">
              Request a Quote
            </Button>
          </div>

          {/* Named collections rather than anonymous dots -- the control tells
              you what you are switching to. */}
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-line pt-5">
            {slides.map((slide, index) => (
              <button
                key={slide.href}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex}
                className={cn(
                  "border-b pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
                  index === activeIndex
                    ? "border-gold-500 text-navy-950"
                    : "border-transparent text-ink-500 hover:text-navy-950",
                )}
              >
                {slide.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crossfade only. No transform, no overlay, no shadow. */}
        <div className="relative aspect-[5/4] w-full overflow-hidden border border-line bg-sunken lg:aspect-[4/3]">
          {slides.map((slide, index) => (
            <Image
              key={slide.image}
              src={slide.image}
              alt={index === activeIndex ? slide.alt : ""}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={index === 0}
              aria-hidden={index !== activeIndex}
              className={cn(
                "object-cover transition-opacity duration-500",
                index === activeIndex ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
