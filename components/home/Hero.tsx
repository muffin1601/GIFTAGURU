"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
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
    }, 6000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden border-b border-line"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* On mobile the image gets its own box and the copy sits below it in
          normal flow on plain ground -- overlaying a full headline + body +
          two buttons on top of a photo never had room to breathe in a 16:9
          strip a few hundred pixels tall. From sm upward there's enough
          width for the original overlay-on-banner treatment. */}
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9] lg:aspect-[2.75/1]">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${activeIndex * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div key={slide.image} className="relative h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
              <Image
                src={slide.image}
                alt={index === activeIndex ? slide.alt : ""}
                fill
                sizes="100vw"
                priority={index === 0}
                aria-hidden={index !== activeIndex}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Copy sits directly on each banner's plain left-hand ground on
            larger screens -- no overlay needed since every slide keeps that
            area clear. Hidden here on mobile; the in-flow block below the
            image takes over instead. */}
        <div className="absolute inset-0 hidden items-center sm:flex">
          <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <span className="type-eyebrow text-gold-600">{active.eyebrow}</span>
              {/* Deliberately a <p>, not an <h1>. The mobile copy block below
                  carries the real <h1> for this slide: both blocks render the
                  same title, and emitting two <h1> elements gave the homepage
                  two top-level headings in the DOM. The heading lives on the
                  mobile block because Google indexes mobile-first, so that is
                  the variant it actually sees rendered rather than
                  display:none. Visual styling is identical. */}
              <p className="type-h1 mt-3 text-navy-950 sm:mt-4">{active.title}</p>
              <p className="type-lead mt-3 text-ink-600">{active.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={active.href} variant="primary">
                  Explore Collection
                </Button>
                <Button href="/bulk-enquiry" variant="secondary">
                  Request a Quote
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow controls. */}
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center border border-cream-100/40 bg-navy-950/30 p-2 text-cream-100 backdrop-blur-sm transition-colors duration-200 hover:bg-navy-950/60 sm:inline-flex"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center border border-cream-100/40 bg-navy-950/30 p-2 text-cream-100 backdrop-blur-sm transition-colors duration-200 hover:bg-navy-950/60 sm:inline-flex"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Dot indicators. */}
        <div className="absolute right-5 top-5 flex items-center gap-2 sm:right-8 lg:right-12">
          {slides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              onClick={() => goTo(index)}
              aria-current={index === activeIndex}
              aria-label={`Show ${slide.label} slide`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === activeIndex ? "w-6 bg-gold-400" : "w-2 bg-cream-100/50 hover:bg-cream-100/80",
              )}
            />
          ))}
        </div>
      </div>

      {/* Mobile-only copy block, in normal document flow below the image. */}
      <div className="px-5 py-8 sm:hidden">
        <span className="type-eyebrow text-gold-600">{active.eyebrow}</span>
        <h1 className="type-h1 mt-3 text-navy-950">{active.title}</h1>
        <p className="type-lead mt-3 text-ink-600">{active.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={active.href} variant="primary">
            Explore Collection
          </Button>
          <Button href="/bulk-enquiry" variant="secondary">
            Request a Quote
          </Button>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
          {slides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              onClick={() => goTo(index)}
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
    </section>
  );
}
