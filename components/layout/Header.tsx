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
  { label: "Bulk Orders", href: "/bulk-enquiry" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-950/10 bg-cream-100/95 backdrop-blur">
      <div className="hidden border-b border-navy-950/10 bg-navy-950 text-cream-100/85 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs tracking-wide">
          <span>Premium corporate gifting, curated for modern businesses.</span>
          <a href={`tel:${STORE_CONTACT.phoneHref}`} className="inline-flex items-center gap-1.5 hover:text-gold-300">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {STORE_CONTACT.phone}
          </a>
        </Container>
      </div>
      <Container className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link href="/" className="flex min-w-0 items-center" aria-label="Gifta Guru home">
          <Image src="/SBanners/SBanners/NEW LOGO.png" alt="Gifta Guru" width={210} height={94} className="h-14 w-auto shrink-0 sm:h-16" preload />
        </Link>

        <nav className="hidden items-center justify-center gap-5 lg:flex xl:gap-7">
          <Link href="/" className="text-sm font-medium text-navy-950 transition-colors hover:text-gold-600">
            Home
          </Link>
          <Link href="/shop" className="text-sm font-medium text-navy-950 transition-colors hover:text-gold-600">
            Shop
          </Link>
          <CollectionsDropdown />
          <Link href="/contact" className="text-sm font-medium text-navy-950 transition-colors hover:text-gold-600">
            Contact
          </Link>
          <Link
            href="/bulk-enquiry"
            className="rounded-full border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-700"
          >
            Request a Quote
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5 sm:inline-flex"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden items-center justify-center rounded-full p-2 text-navy-950 hover:bg-navy-950/5 sm:inline-flex"
          >
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </Link>
          <CartLink />
          <MobileNav links={mobileLinks} />
        </div>
      </Container>
    </header>
  );
}
