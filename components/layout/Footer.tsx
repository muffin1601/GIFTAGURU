import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { footerColumns, footerLegalLinks } from "@/data/nav";
import { STORE_CONTACT } from "@/lib/config/store";

const footerLinkClass = "group inline-flex items-center gap-1 text-sm text-ink-700 transition-colors duration-200 hover:text-navy-950";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream-200 text-navy-950">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.35fr_repeat(5,1fr)] lg:gap-8 lg:py-20">
        <div className="lg:pr-8">
          <Image src="/SBanners/SBanners/NEW LOGO.png" alt="Gifta Guru" width={225} height={100} className="h-auto w-48" />
          <p className="mt-6 max-w-sm text-sm leading-7 text-ink-700">A premium corporate gifting partner helping businesses across India curate, customise and deliver thoughtful gifts at scale.</p>
          <ul className="mt-7 space-y-4 text-sm text-ink-700">
            <li><a href={`tel:${STORE_CONTACT.phoneHref}`} className="inline-flex items-center gap-3 hover:text-navy-950"><Phone className="h-4 w-4 text-gold-600" strokeWidth={1.5} aria-hidden="true" />+91 {STORE_CONTACT.phone}</a></li>
            <li><a href={`mailto:${STORE_CONTACT.email}`} className="inline-flex items-center gap-3 hover:text-navy-950"><Mail className="h-4 w-4 text-gold-600" strokeWidth={1.5} aria-hidden="true" />{STORE_CONTACT.email}</a></li>
            <li className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" /><span>{STORE_CONTACT.address}</span></li>
          </ul>
        </div>

        {footerColumns.map((column) => <nav key={column.heading} aria-label={column.heading}><h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-700">{column.heading}</h2><ul className="mt-5 flex flex-col gap-3">{column.links.map((link) => <li key={link.href}><Link href={link.href} className={footerLinkClass}>{link.label}<ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" /></Link></li>)}</ul></nav>)}
      </Container>

      <div className="border-t border-navy-950/10 bg-navy-950 text-cream-100/60"><Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row"><span>&copy; {new Date().getFullYear()} Gifta Guru. All rights reserved.</span><div className="flex items-center gap-6">{footerLegalLinks.map((link) => <Link key={link.href} href={link.href} className="transition-colors duration-200 hover:text-gold-300">{link.label}</Link>)}</div></Container></div>
    </footer>
  );
}
