"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export type HeroSlide = { id: string; label: string; src: string; href: string };

const AUTOPLAY_MS = 5000;
const controlClass = "inline-flex size-9 items-center justify-center rounded-full border border-line-strong text-navy-950 hover:border-navy-950";

/**
 * Auto-advancing homepage banner carousel. Slides come from /admin/banners.
 *
 * Autoplay only stops when the visitor presses Pause. Hovering or keyboard
 * focus inside the carousel holds it temporarily; using the arrows or dots
 * restarts the countdown instead of stopping rotation for good.
 */
export default function CorporateHeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const count = slides.length;
  const current = Math.min(activeIndex, Math.max(count - 1, 0));

  useEffect(() => {
    if (count < 2 || paused || hovered || focused) return;
    // A timeout keyed on the active slide (rather than an interval) means any
    // manual navigation automatically restarts the full countdown.
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, count, paused, hovered, focused]);

  if (count === 0) return null;

  function selectSlide(index: number) {
    setActiveIndex((index + count) % count);
  }

  return (
    <section className="border-b border-line bg-canvas">
      <Container className="py-4 sm:py-6">
        <div role="region" aria-roledescription="carousel" aria-label="Featured gift collections"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocus={(event) => { if (event.target.matches(":focus-visible")) setFocused(true); }}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
          <div className="relative aspect-[8/3] overflow-hidden rounded-xl bg-sunken sm:rounded-2xl">
            {slides.map((slide, index) => (
              <Link key={slide.id} href={slide.href} aria-label={`Explore ${slide.label}`}
                aria-hidden={current !== index} tabIndex={current === index ? 0 : -1}
                className={`absolute inset-0 focus-visible:outline-offset-[-4px] motion-safe:transition-opacity motion-safe:duration-500 ${current === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}>
                <Image src={slide.src} alt="" fill preload={index === 0}
                  sizes="(min-width: 84rem) 78rem, (min-width: 64rem) calc(100vw - 6rem), (min-width: 40rem) calc(100vw - 4rem), calc(100vw - 2.5rem)"
                  className="object-contain" />
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
            <span className="text-sm font-semibold text-navy-950" aria-live={paused ? "polite" : "off"}>{slides[current].label}</span>
            {count > 1 ? (
              <div className="flex items-center gap-1">
                <button type="button" className={controlClass} aria-label="Previous banner" onClick={() => selectSlide(current - 1)}><ArrowLeft size={16} /></button>
                {slides.map((slide, index) => (
                  <button key={slide.id} type="button" className="grid h-9 w-5 place-items-center" aria-label={`Show ${slide.label}`} aria-current={current === index} onClick={() => selectSlide(index)}>
                    <span className={`h-1.5 rounded-full motion-safe:transition-all ${index === current ? "w-4 bg-gold-600" : "w-1.5 bg-navy-950/30"}`} />
                  </button>
                ))}
                <button type="button" className={controlClass} aria-label="Next banner" onClick={() => selectSlide(current + 1)}><ArrowRight size={16} /></button>
                <button type="button" className={controlClass} aria-label={paused ? "Play carousel" : "Pause carousel"} onClick={() => setPaused((value) => !value)}>
                  {paused ? <Play size={15} /> : <Pause size={15} />}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 py-5">
          <div>
            <p className="type-eyebrow">Premium corporate gifting</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-navy-950 sm:text-4xl">Thoughtful Gifts. Lasting Impressions.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/corporate-gifting">Explore Corporate Gifts</Button>
            <Button href="/bulk-enquiry" variant="secondary">Request a Custom Quote</Button>
            <Link href="#business-moments" className="link-underline text-sm font-semibold">Discover more</Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
