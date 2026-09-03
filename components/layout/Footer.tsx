import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { footerColumns, footerLegalLinks } from "@/data/nav";
import { STORE_CONTACT } from "@/lib/config/store";

const footerLinkClass =
  "text-sm text-cream-100/70 transition-colors duration-200 hover:text-gold-300";

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy-950 text-cream-100">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-10 lg:py-20">
        <div className="flex flex-col gap-5">
          <Image
            src="/SBanners/SBanners/NEW LOGO.png"
            alt="Gifta Guru"
            width={225}
            height={100}
            className="h-auto w-44 brightness-0 invert"
          />
          <p className="max-w-xs text-sm leading-relaxed text-cream-100/70">
            A premium corporate gifting partner helping businesses across India curate, customize
            and deliver thoughtful gifts at scale.
          </p>

          <ul className="mt-1 flex flex-col gap-3 text-sm text-cream-100/70">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" strokeWidth={1.5} />
              <a href={`tel:${STORE_CONTACT.phoneHref}`} className="hover:text-gold-300">
                +91 {STORE_CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" strokeWidth={1.5} />
              <a href={`mailto:${STORE_CONTACT.email}`} className="break-all hover:text-gold-300">
                {STORE_CONTACT.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" strokeWidth={1.5} />
              <span>{STORE_CONTACT.address}</span>
            </li>
          </ul>

          <div className="mt-1 flex items-center gap-4">
            {(["facebook", "instagram", "linkedin"] as const).map((platform) => (
              <Link
                key={platform}
                href="#"
                aria-label={platform}
                className="text-cream-100/60 transition-colors duration-200 hover:text-gold-300"
              >
                <SocialIcon platform={platform} />
              </Link>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            {/* h2, not h3: the footer renders on every page, including ones
                whose body has no h2 of its own (shop, login, 404). At h3 those
                pages skipped a level straight from the page h1, which is a
                WCAG 1.3.1 heading-order failure. The visual size is set by the
                classes, so nothing changes on screen. */}
            <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
              {column.heading}
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-cream-100/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream-100/50 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Gifta Guru. All rights reserved.</span>
          <div className="flex items-center gap-6">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
