import Image from "next/image";
import Link from "next/link";
import { Phone, Search, UserRound } from "lucide-react";
import Container from "@/components/ui/Container";
import MobileNav from "@/components/layout/MobileNav";
import CartLink from "@/components/cart/CartLink";
import CollectionsDropdown from "@/components/layout/CollectionsDropdown";
import { STORE_CONTACT } from "@/lib/config/store";

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/categories" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Custom Branding", href: "/custom-gifts" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "Request a Quote", href: "/bulk-enquiry" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const navLinkClass =
  "text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:text-gold-600";

const iconLinkClass =
  "inline-flex items-center justify-center p-2 text-navy-950 transition-colors duration-200 hover:text-gold-600";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="hidden bg-navy-950 text-cream-100/80 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs tracking-wide">
          <span>Premium corporate gifting, curated for modern businesses.</span>
          <a
            href={`tel:${STORE_CONTACT.phoneHref}`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-300"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
            {STORE_CONTACT.phone}
          </a>
        </Container>
      </div>

      <Container className="grid h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/" className="flex min-w-0 items-center" aria-label="Gifta Guru home">
          <Image
            src="/SBanners/SBanners/NEW LOGO.png"
            alt="Gifta Guru"
            width={210}
            height={94}
            className="h-11 w-auto shrink-0 sm:h-12"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          <Link href="/shop" className={navLinkClass}>
            Shop
          </Link>
          <CollectionsDropdown />
          <Link href="/corporate-gifting" className={navLinkClass}>
            Corporate
          </Link>
          <Link href="/custom-gifts" className={navLinkClass}>
            Custom Branding
          </Link>
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-1">
          <Link
            href="/bulk-enquiry"
            className="mr-3 hidden border border-line-strong px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:border-navy-950 xl:inline-flex"
          >
            Request a Quote
          </Link>
          <Link href="/search" aria-label="Search" className={`hidden sm:inline-flex ${iconLinkClass}`}>
            <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" strokeWidth={1.5} />
          </Link>
          <Link href="/account" aria-label="Account" className={`hidden sm:inline-flex ${iconLinkClass}`}>
            <UserRound className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" strokeWidth={1.5} />
          </Link>
          <CartLink />
          <MobileNav links={mobileLinks} />
        </div>
      </Container>
    </header>
  );
}
