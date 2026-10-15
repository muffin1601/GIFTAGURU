import type { ReactNode } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export default function LegalDocument({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Legal information" title={title} description={description} breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]} image="/BANNERS/LUXURY.png" />
      <section className="section bg-canvas">
        <Container className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:items-start">
          <aside className="hanna-card bg-navy-950 p-7 text-cream-100 lg:sticky lg:top-40">
            <ShieldCheck className="h-6 w-6 text-gold-300" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-5 font-display text-2xl font-semibold">Clear business information</p>
            <p className="mt-3 text-sm leading-6 text-cream-100/70">This document explains the principles that apply when using the Gifta Guru website and services.</p>
          </aside>
          <article className="editorial-panel legal-document">
            <div className="flex items-center gap-3 border-b border-line pb-6"><FileText className="h-5 w-5 text-gold-600" strokeWidth={1.5} aria-hidden="true" /><p className="type-eyebrow">{title}</p></div>
            <div className="mt-8 space-y-5 text-[0.95rem] leading-8 text-ink-700">{children}</div>
          </article>
        </Container>
      </section>
    </>
  );
}
