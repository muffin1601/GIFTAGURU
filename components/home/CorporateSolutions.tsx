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
    <section id="solutions" className="section bg-sunken">
      <Container className="flex flex-col gap-14 sm:gap-20">
        <SectionHeading
          eyebrow="Corporate Gifting Solutions"
          title="Gifting programs for every business moment"
          description="From a new hire's first day to your most important client relationship, we design gifting that fits the occasion."
        />
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon];
            return (
              <div key={solution.id} id={solution.id} className="border-t border-line-strong pt-6">
                <Icon className="h-5 w-5 text-gold-600" strokeWidth={1.25} aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg text-navy-950">{solution.title}</h3>
                <p className="type-body mt-2">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
