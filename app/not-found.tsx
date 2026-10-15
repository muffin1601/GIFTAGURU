import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[65vh] items-center bg-cream-200 py-20">
      <Container className="w-full">
        <div className="hanna-card mx-auto grid max-w-5xl overflow-hidden bg-surface lg:grid-cols-[0.38fr_0.62fr]">
          <div className="flex min-h-64 items-center justify-center bg-navy-950 p-8"><span className="font-display text-[8rem] font-bold leading-none text-gold-300">404</span></div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <span className="type-eyebrow">Page not found</span>
            <h1 className="type-h1 mt-4">We couldn&apos;t find that page</h1>
            <p className="type-lead mt-5">The page may have moved or no longer exists. Continue with the current gift catalogue or return home.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Button href="/">Back to home</Button><Button href="/shop" variant="secondary">Browse gifts</Button></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
