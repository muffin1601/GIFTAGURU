import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { footerCategoryLinks, footerLegalLinks, footerSolutionLinks, mainNav } from "@/data/nav";
import { STORE_CONTACT } from "@/lib/config/store";

export default function Footer() {
  return (
    <footer className="border-t border-navy-950/10 bg-navy-950 text-cream-100">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Image
            src="/SBanners/SBanners/NEW LOGO.png"
            alt="Gifta Guru"
            width={225}
            height={100}
            className="h-auto w-48 brightness-0 invert sm:w-56"
          />
          <p className="max-w-sm text-sm text-cream-100/70">
            Gifta Guru is a premium corporate gifting platform helping businesses across India
            discover, customize, and deliver thoughtful gifts at scale.
          </p>
          <div className="flex items-center gap-3">
            <Link href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <SocialIcon platform="facebook" />
            </Link>
            <Link href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <SocialIcon platform="instagram" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <SocialIcon platform="linkedin" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">Quick Links</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream-100/80 hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">Gift Categories</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {footerCategoryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream-100/80 hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gold-400">
            Corporate Solutions
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {footerSolutionLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream-100/80 hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">Contact</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-cream-100/80">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`tel:${STORE_CONTACT.phoneHref}`} className="hover:text-gold-300">+91 {STORE_CONTACT.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`mailto:${STORE_CONTACT.email}`} className="hover:text-gold-300">{STORE_CONTACT.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              {STORE_CONTACT.address}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream-100/60 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Gifta Guru. All rights reserved.</span>
          <div className="flex items-center gap-5">
            {footerLegalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold-300">
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
