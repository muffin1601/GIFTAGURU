import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CategoryCard from "@/components/ui/CategoryCard";
import { getFeaturedCollectionsAsCategories } from "@/lib/data/collections";

export default async function GiftCategories() {
  const categories = await getFeaturedCollectionsAsCategories();

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Gifting collections for every occasion"
          description="Explore curated gift ranges designed for onboarding, appreciation, leadership, and sustainable gifting."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
