import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import CategoryCard from "@/components/ui/CategoryCard";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gift Categories | Gifta Guru",
  description: "Browse eco, joining, luxury, and premium corporate gifting collections.",
};

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
    </>
  );
}
