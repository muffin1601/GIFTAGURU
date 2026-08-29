import Container from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="h-4 w-40 animate-pulse rounded bg-navy-950/10" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="grid gap-4">
          <div className="aspect-square animate-pulse rounded-2xl bg-navy-950/10" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-xl bg-navy-950/10" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-navy-950/10" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-navy-950/10" />
          <div className="h-4 w-full animate-pulse rounded bg-navy-950/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-navy-950/10" />
          <div className="h-8 w-40 animate-pulse rounded bg-navy-950/10" />
          <div className="h-40 w-full animate-pulse rounded-2xl bg-navy-950/10" />
        </div>
      </div>
    </Container>
  );
}
