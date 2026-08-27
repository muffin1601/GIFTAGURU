import { UserPlus, Award, Handshake, Gift, CalendarDays, Crown, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { solutions } from "@/data/solutions";

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Award,
  Handshake,
  Gift,
  CalendarDays,
  Crown,
};

export default function CorporateSolutions() {
  return (
    <section id="solutions" className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Corporate Gifting Solutions"
          title="Gifting programs for every business moment"
          description="From a new hire's first day to your most important client relationship, we design gifting that fits the occasion."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon];
            return (
              <div
                key={solution.id}
                id={solution.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-navy-950/5 transition-shadow hover:shadow-md"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-navy-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg text-navy-950">{solution.title}</h3>
                <p className="text-sm text-ink-700">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
