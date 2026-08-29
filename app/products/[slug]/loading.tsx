import Container from "@/components/ui/Container";

/**
 * Static skeleton. The design system rules out pulse/glow animation, so the
 * placeholders are quiet tonal blocks that match the real layout's geometry.
 */
const block = "bg-sunken";

export default function ProductLoading() {
  return (
    <Container className="py-6 sm:py-10" aria-busy="true" aria-label="Loading product">
      <div className={`h-3 w-40 ${block}`} />

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className={`aspect-square border border-line ${block}`} />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`aspect-square border border-line ${block}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`h-3 w-32 ${block}`} />
          <div className={`h-12 w-3/4 ${block}`} />
          <div className={`h-4 w-full ${block}`} />
          <div className={`h-4 w-5/6 ${block}`} />
          <div className={`mt-4 h-8 w-40 ${block}`} />
          <div className={`mt-4 h-48 w-full ${block}`} />
        </div>
      </div>
    </Container>
  );
}
