import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import HeroBenefits from "@/components/home/HeroBenefits";
import GiftCategories from "@/components/home/GiftCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CorporateSolutions from "@/components/home/CorporateSolutions";
import CustomGifting from "@/components/home/CustomGifting";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SeoIntro from "@/components/home/SeoIntro";
import BulkOrderCTA from "@/components/home/BulkOrderCTA";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqPageSchema } from "@/lib/seo/schema";
import { faqs } from "@/data/faqs";

export const dynamic = "force-dynamic";

/**
 * The homepage previously had no metadata export of its own and inherited the
 * root layout's defaults. That worked, but it meant the single most important
 * page on the site could not state its own canonical or its own commercial
 * positioning. It now owns the broad head terms explicitly.
 */
export const metadata: Metadata = pageMetadata({
  title: "Corporate Gifts & Personalized Corporate Gifting | Gifta Guru",
  description:
    "Corporate gifts and custom gift sets with logo branding. Employee welcome kits, client gifting, luxury and eco sets, with bulk pricing across India.",
  path: "",
});

export default function Home() {
  return (
    <>
      {/* Mirrors the FAQ section rendered at the bottom of this page. */}
      <JsonLd data={faqPageSchema(faqs.map(({ question, answer }) => ({ question, answer })))} />
      <Hero />
      <HeroBenefits />
      <GiftCategories />
      <WhyChooseUs />
      <CorporateSolutions />
      <CustomGifting />
      <HowItWorks />
      <FeaturedProducts />
      <SeoIntro />
      <BulkOrderCTA />
      <Testimonials />
      <FAQ />
    </>
  );
}
