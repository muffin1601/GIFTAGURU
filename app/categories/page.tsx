import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import CategoryCard from "@/components/ui/CategoryCard";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";
import { pageMetadata } from "@/lib/seo/metadata";
import BusinessBuyerGuide from "@/components/content/BusinessBuyerGuide";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Gift Categories | Gifta Guru",
  description: "Browse eco, joining, luxury, and premium corporate gifting collections.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getFeaturedCollectionsAsCategories();

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Explore our gifting collections"
        description="Every collection is curated for a specific business moment, from onboarding to leadership gifting."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </Container>
      </section>
      <BusinessBuyerGuide
        title="How businesses choose a corporate gift collection"
        paragraphs={[
          "Choose a collection around the role the gift plays. Joining and stationery-led sets suit onboarding and recurring employee programmes, premium and luxury sets suit important relationships, and eco-friendly choices give sustainability-led organisations a more considered option.",
          "Every collection can be explored as a starting point, then refined for branding, recipient lists and quantity through a corporate enquiry.",
        ]}
        links={[{ label: "Plan employee welcome kits", href: "/gifting/employee-onboarding" }, { label: "Browse client gifting ideas", href: "/gifting/client-appreciation" }, { label: "Request corporate pricing", href: "/bulk-enquiry" }]}
      />
    </>
  );
}
