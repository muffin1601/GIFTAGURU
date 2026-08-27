"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

const slides = [
  {
    eyebrow: "Joining Gifts",
    title: "Welcome kits that make day one feel thoughtful.",
    description:
      "Curated onboarding gifts with notebooks, pens, desk accessories, and custom branding for new hires.",
    image: "/BANNERS/JOINING.png",
    alt: "Joining gift collection by Gifta Guru",
    href: "/categories/joining-gifts",
  },
  {
    eyebrow: "Eco-Friendly Gifts",
    title: "Sustainable gifting that still feels premium.",
    description:
      "Eco-conscious gift sets for teams and clients who value useful products, responsible materials, and clean presentation.",
    image: "/BANNERS/ECO.png",
    alt: "Eco-friendly corporate gift collection by Gifta Guru",
    href: "/categories/eco-gifts",
  },
  {
    eyebrow: "Premium Gifts",
    title: "Corporate gifts that unbox culture, not clutter.",
    description:
      "Premium gift sets for appreciation, events, client relationships, and bulk campaigns across India.",
    image: "/BANNERS/PREMIUM.png",
    alt: "Premium corporate gift sets from Gifta Guru",
    href: "/categories/premium-gifts",
  },
  {
    eyebrow: "Luxury Gifts",
    title: "Executive gifts for high-value business moments.",
    description:
      "Refined luxury sets for leadership, festive gifting, and important clients where presentation matters.",
    image: "/BANNERS/LUXURY.png",
    alt: "Luxury corporate gift collection by Gifta Guru",
    href: "/categories/luxury-gifts",
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused]);

  function previousSlide() {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }

  function nextSlide() {
    setActiveIndex((index) => (index + 1) % slides.length);
  }

  return (
    <section
      className="relative h-[380px] overflow-hidden bg-navy-950 sm:h-[440px] lg:h-[500px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.image} className="relative h-full min-w-full">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,241,0.74)_0%,rgba(255,250,241,0.48)_32%,rgba(255,250,241,0.08)_62%,rgba(255,250,241,0)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[54%] bg-[radial-gradient(circle_at_24%_42%,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.45)_36%,rgba(255,255,255,0)_70%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-start px-4 pb-20 pt-14 sm:px-6 sm:pt-18 lg:px-8 lg:pt-20">
        <div className="flex max-w-[560px] flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">
            {activeSlide.eyebrow}
          </span>
          <h1 className="mt-5 font-display text-3xl leading-[1.08] text-navy-950 sm:text-4xl lg:text-[52px]">
            {activeSlide.title}
          </h1>
          <p className="mt-6 max-w-[500px] text-base leading-7 text-ink-800 sm:text-lg">
            {activeSlide.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Button href={activeSlide.href} variant="primary" className="!bg-gold-500 !text-navy-950 shadow-sm shadow-gold-900/10 hover:!bg-gold-400">
              Explore Collection
            </Button>
            <Button href="/bulk-enquiry" variant="secondary" className="!border-navy-950/35 !text-navy-950 hover:!bg-navy-950 hover:!text-white">
              Request a Quote
            </Button>
          </div>
          <div className="flex items-center gap-2 pt-8">
            {slides.map((slide, index) => (
              <button
                key={slide.href}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${slide.eyebrow} slide`}
                aria-current={index === activeIndex}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-gold-500" : "w-2.5 bg-white/60 hover:bg-white/90"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex w-full max-w-7xl -translate-x-1/2 justify-end px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous hero slide"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next hero slide"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-sm hover:bg-white"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
