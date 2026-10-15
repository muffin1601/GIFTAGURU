import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

/** Static, server-rendered hero modelled on Hanna's compact copy + paired-image composition. */
export default function CorporateHeroSlider() {
  return (
    <section className="border-b border-line bg-[#eeefec]">
      <Container className="grid min-h-[39rem] items-center gap-12 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="type-eyebrow">Premium corporate gifting</p>
          <h1 className="mt-5 max-w-[11ch] font-display text-[clamp(3rem,5vw,5.9375rem)] font-bold leading-[0.88] tracking-[-0.04em] text-navy-950">
            Thoughtful Gifts. Lasting Impressions.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-ink-700">
            Curated corporate gifts, employee welcome kits and custom-branded experiences that make every business relationship memorable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/corporate-gifting">Explore Corporate Gifts <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
            <Button href="/bulk-enquiry" variant="secondary">Request a Custom Quote</Button>
          </div>
          <Link href="#business-moments" className="mt-10 inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-navy-950">
            Discover more <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative mx-auto grid w-full max-w-[36rem] grid-cols-2 items-end gap-4 sm:gap-6">
          <div className="hanna-arch-frame relative aspect-[3/4] bg-[#dde5e1] p-3 sm:p-5">
            <div className="hanna-arch relative h-full w-full bg-surface">
              <Image src="/Gifta Guru/Set 21/1 (1).png" alt="Black executive corporate gift set" fill priority sizes="(min-width: 1024px) 24vw, 45vw" className="object-contain p-2 sm:p-4" />
            </div>
          </div>
          <div className="hanna-arch-frame relative mb-8 aspect-[3/4] bg-[#eadfd3] p-3 sm:p-5">
            <div className="hanna-arch relative h-full w-full bg-surface">
              <Image src="/Hampers/set 3/1 (1).webp" alt="Premium curated corporate hamper" fill sizes="(min-width: 1024px) 24vw, 45vw" className="object-contain p-2 sm:p-4" />
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-gold-400 bg-navy-950 text-center text-[0.58rem] font-semibold uppercase leading-4 tracking-[0.12em] text-cream-100 shadow-[0_10px_40px_-5px_rgba(10,26,48,0.25)] sm:h-24 sm:w-24">
            Curated<br />for your<br />brand
          </div>
        </div>
      </Container>
    </section>
  );
}
