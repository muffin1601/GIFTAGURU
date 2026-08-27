import Hero from "@/components/home/Hero";
import HeroBenefits from "@/components/home/HeroBenefits";
import GiftCategories from "@/components/home/GiftCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CorporateSolutions from "@/components/home/CorporateSolutions";
import CustomGifting from "@/components/home/CustomGifting";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BulkOrderCTA from "@/components/home/BulkOrderCTA";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <HeroBenefits />
      <GiftCategories />
      <WhyChooseUs />
      <CorporateSolutions />
      <CustomGifting />
      <HowItWorks />
      <FeaturedProducts />
      <BulkOrderCTA />
      <Testimonials />
      <FAQ />
    </>
  );
}
