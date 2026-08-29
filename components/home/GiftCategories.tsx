import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CategoryCard from "@/components/ui/CategoryCard";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";

export default async function GiftCategories() {
  const categories = await getFeaturedCollectionsAsCategories();

  return (
    <section className="section">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Gifts for every business moment"
          description="Curated ranges for onboarding, appreciation, leadership and sustainable gifting."
        />
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:gap-x-10">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
