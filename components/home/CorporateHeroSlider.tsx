"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const visualSlides = [
  {
    label: "Executive gifting",
    left: {
      src: "/Gifta Guru/Set 21/1 (1).png",
      alt: "Black executive corporate gift set",
      background: "bg-[#dde5e1]",
    },
    right: {
      src: "/Hampers/set 3/1 (1).webp",
      alt: "Premium curated corporate hamper",
      background: "bg-[#eadfd3]",
    },
  },
  {
    label: "Branded essentials",
    left: {
      src: "/Gifta Guru/Set 16/1 (1).png",
      alt: "Wood-finish branded stationery gift set",
      background: "bg-[#e6e0d5]",
    },
    right: {
      src: "/Gifta Guru/Set 3/1 (1).png",
      alt: "Compact black corporate essentials gift set",
      background: "bg-[#dce3e1]",
    },
  },
  {
    label: "Festive appreciation",
    left: {
      src: "/Diwali kits/Set 8/Primary_1.webp",
      alt: "Corporate Diwali appreciation hamper",
      background: "bg-[#e8ddd3]",
    },
    right: {
      src: "/Gifta Guru/Set 12/1 (1).png",
      alt: "Premium tan executive corporate gift set",
      background: "bg-[#e3e5dc]",
    },
  },
] as const;

/** Hanna-inspired hero with a carousel confined to the paired product artwork. */
export default function CorporateHeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visualSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (index: number) => {
    setActiveIndex((index + visualSlides.length) % visualSlides.length);
  };

  return (
    <section className="border-b border-line bg-[#eeefec]">
      <Container className="grid min-h-[34rem] items-center gap-9 py-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10 lg:py-12">
        <div className="max-w-lg">
          <p className="type-eyebrow">Premium corporate gifting</p>
          <h1 className="mt-3 max-w-[12ch] font-display text-[clamp(2.75rem,4vw,4.75rem)] font-bold leading-[0.92] tracking-[-0.035em] text-navy-950">
            Thoughtful Gifts. Lasting Impressions.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-ink-700 sm:text-[0.9375rem]">
            Curated corporate gifts, employee welcome kits and custom-branded experiences that make every business relationship memorable.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/corporate-gifting">Explore Corporate Gifts <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
            <Button href="/bulk-enquiry" variant="secondary">Request a Custom Quote</Button>
          </div>
          <Link href="#business-moments" className="mt-7 inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-navy-950">
            Discover more <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>

        <div
          className="relative mx-auto w-full max-w-[43rem]"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured corporate gift collections"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative">
            <div className="relative grid grid-cols-2 items-end gap-4 sm:gap-6">
              {visualSlides.map((slide, index) => (
                <div
                  key={slide.label}
                  className={cn(
                    "col-span-2 grid grid-cols-2 items-end gap-4 transition-all duration-700 ease-out sm:gap-6",
                    index === activeIndex
                      ? "relative translate-x-0 opacity-100"
                      : "pointer-events-none absolute inset-0 translate-x-5 opacity-0",
                  )}
                  aria-hidden={index !== activeIndex}
                >
                  <div className={cn("hanna-arch-frame relative aspect-[3/4] p-3 sm:p-5", slide.left.background)}>
                    <div className="hanna-arch relative h-full w-full bg-surface">
                      <Image
                        src={slide.left.src}
                        alt={index === activeIndex ? slide.left.alt : ""}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 24vw, 45vw"
                        className="object-contain p-2 sm:p-4"
                      />
                    </div>
                  </div>
                  <div className={cn("hanna-arch-frame relative mb-8 aspect-[3/4] p-3 sm:p-5", slide.right.background)}>
                    <div className="hanna-arch relative h-full w-full bg-surface">
                      <Image
                        src={slide.right.src}
                        alt={index === activeIndex ? slide.right.alt : ""}
                        fill
                        sizes="(min-width: 1024px) 24vw, 45vw"
                        className="object-contain p-2 sm:p-4"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-2 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-gold-400 bg-navy-950 text-center text-[0.58rem] font-semibold uppercase leading-4 tracking-[0.12em] text-cream-100 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.25)] sm:h-24 sm:w-24">
              Curated<br />for your<br />brand
            </div>

            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400 bg-surface text-navy-950 transition-colors duration-200 hover:bg-navy-950 hover:text-cream-100 sm:h-11 sm:w-11"
              aria-label="Previous gift collection"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400 bg-surface text-navy-950 transition-colors duration-200 hover:bg-navy-950 hover:text-cream-100 sm:h-11 sm:w-11"
              aria-label="Next gift collection"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-7 flex items-center justify-end gap-3 pr-2 sm:pr-4">
            <span className="mr-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-600" aria-live="polite">
              {visualSlides[activeIndex].label}
            </span>
            {visualSlides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex ? "w-7 bg-gold-500" : "w-1.5 bg-navy-950/25 hover:bg-navy-950/60",
                )}
                aria-label={`Show ${slide.label}`}
                aria-current={index === activeIndex}
              />
            ))}
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-navy-950 transition-colors duration-200 hover:border-navy-950"
              aria-label={paused ? "Play gift carousel" : "Pause gift carousel"}
            >
              {paused ? <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> : <Pause className="h-3 w-3" fill="currentColor" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
