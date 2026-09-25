"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const slides = [
  {
    eyebrow: "Premium corporate gifting",
    title: "Thoughtful corporate gifts, built around your brand.",
    description: "Plan branded employee kits, client gifts, festive hampers and bulk gifting programmes from one experienced team.",
    image: "/BANNERS/PREMIUM.png",
    alt: "Premium corporate gifting collection",
    primaryHref: "/corporate-gifting",
    primaryLabel: "Explore Corporate Gifts",
  },
  {
    eyebrow: "Sustainable corporate gifting",
    title: "Useful gifts with a lighter footprint.",
    description: "Build an eco-conscious gifting programme with considered materials, useful products and custom branding options.",
    image: "/BANNERS/ECO.png",
    alt: "Sustainable corporate gift collection",
    primaryHref: "/categories/eco-gifts",
    primaryLabel: "Explore Sustainable Gifts",
  },
  {
    eyebrow: "Employee welcome kits",
    title: "A welcome that feels like day one, done well.",
    description: "Create new-joiner kits with desk essentials, drinkware, packaging and a message that introduces your culture.",
    image: "/BANNERS/JOINING.png",
    alt: "Employee welcome-kit collection",
    primaryHref: "/gifting/employee-onboarding",
    primaryLabel: "Build a Welcome Kit",
  },
  {
    eyebrow: "Executive & client gifts",
    title: "Executive gifts for high-value business moments.",
    description: "Choose refined gift sets for leadership, client relationships and occasions where presentation matters.",
    image: "/BANNERS/LUXURY.png",
    alt: "Luxury executive corporate gifting collection",
    primaryHref: "/categories/luxury-gifts",
    primaryLabel: "Explore Executive Gifts",
  },
];

export default function CorporateHeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveIndex((index) => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(interval);
  }, []);

  const active = slides[activeIndex];
  const showSlide = (direction: number) => setActiveIndex((index) => (index + direction + slides.length) % slides.length);

  return (
    <section className="border-b border-line bg-surface">
        <div className="relative w-full overflow-hidden bg-surface" aria-roledescription="carousel" aria-label="Corporate gifting collections">
          <h1 className="sr-only">{active.title}</h1>
          <div className="flex min-h-[34rem] transition-transform duration-700 ease-out sm:min-h-[32rem] lg:min-h-[30rem]" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {slides.map((slide, index) => (
              <article key={slide.title} className="relative min-h-[34rem] w-full shrink-0 bg-sunken sm:min-h-[32rem] lg:min-h-[30rem]" aria-hidden={index !== activeIndex}>
                <div className="absolute inset-0">
                  <Image src={slide.image} alt={index === activeIndex ? slide.alt : ""} fill priority={index === 0} sizes="100vw" className="object-cover" />
                </div>
                <div className="relative z-10 flex min-h-[34rem] items-stretch p-0 sm:min-h-[32rem] lg:min-h-[30rem]">
                  <div className="flex w-full max-w-[42rem] flex-col justify-center bg-transparent py-6 pl-8 pr-6 pb-14 sm:py-7 sm:pl-12 sm:pr-8 sm:pb-14 lg:pl-20 lg:pr-12">
                    <p className="type-eyebrow">{slide.eyebrow}</p>
                    <h2 className="mt-3 max-w-lg font-display text-[2rem] leading-[1.08] text-navy-950 sm:text-[2.5rem] lg:text-[3rem]">{slide.title}</h2>
                    <p className="mt-4 max-w-lg text-sm leading-6 text-ink-700 sm:text-[0.9375rem]">{slide.description}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button href={slide.primaryHref}>{slide.primaryLabel}</Button>
                      <Button href="/bulk-enquiry" variant="secondary">Request a Custom Quote</Button>
                    </div>
                    <ul className="mt-5 grid grid-cols-2 gap-y-2 border-t border-line pt-4 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-700 sm:grid-cols-4 sm:gap-3">
                      <li>Bulk orders</li><li>Custom branding</li><li>Pan-India delivery</li><li>Dedicated support</li>
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-10 lg:left-14">
            {slides.map((slide, index) => <button key={slide.title} type="button" aria-label={`Show ${slide.eyebrow} slide`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-[3px] border border-navy-950 transition-colors duration-200 ${index === activeIndex ? "w-7 bg-navy-950" : "w-2.5 bg-transparent hover:bg-navy-950/20"}`} />)}
          </div>
          <div className="absolute bottom-5 right-6 flex gap-2 sm:right-8">
            <button type="button" aria-label="Previous slide" onClick={() => showSlide(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-line-strong bg-surface text-navy-950 transition-colors duration-200 hover:border-navy-950"><ChevronLeft className="h-4 w-4" strokeWidth={1.5} /></button>
            <button type="button" aria-label="Next slide" onClick={() => showSlide(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-line-strong bg-surface text-navy-950 transition-colors duration-200 hover:border-navy-950"><ChevronRight className="h-4 w-4" strokeWidth={1.5} /></button>
          </div>
        </div>
    </section>
  );
}
