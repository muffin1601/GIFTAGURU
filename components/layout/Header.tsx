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
  { label: "Diwali 2026", href: "/diwali-2026" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Custom Branding", href: "/custom-gifts" },
  { label: "Bulk Orders", href: "/bulk-enquiry" },
  { label: "Corporate Gifting Blog", href: "/blog" },
  { label: "Locations", href: "/locations" },
  { label: "Request a Quote", href: "/bulk-enquiry" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const navLinkClass =
  "text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:text-gold-600";

const iconLinkClass =
  "inline-flex items-center justify-center p-2 text-navy-950 transition-colors duration-200 hover:text-gold-600";

const quickLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Gifting Guides", href: "/blog" },
  { label: "Track Order", href: "/track-order" },
  { label: "Bulk Enquiry", href: "/bulk-enquiry" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="hidden bg-navy-950 text-cream-100/80 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs tracking-wide">
          <nav aria-label="Quick links" className="flex items-center gap-3">
            <span className="text-cream-100/50">Important links</span>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-l border-cream-100/20 pl-3 transition-colors duration-200 hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href={`tel:${STORE_CONTACT.phoneHref}`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-300"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
            {STORE_CONTACT.phone}
          </a>
        </Container>
      </div>

      <Container className="grid h-[4.75rem] grid-cols-[auto_1fr_auto] items-center gap-5 lg:h-20 lg:gap-8">
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

        <form
          action="/search"
          role="search"
          className="mx-auto hidden w-full max-w-[36rem] items-center rounded-[30px] border border-line-strong bg-surface px-2 xl:flex"
        >
          <Search className="ml-3 h-[1.1rem] w-[1.1rem] shrink-0 text-ink-500" aria-hidden="true" strokeWidth={1.5} />
          <label htmlFor="header-search" className="sr-only">Search corporate gifts</label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Search gifts, collections and occasions"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-navy-950 outline-none placeholder:text-ink-500"
          />
          <button type="submit" className="rounded-[30px] bg-navy-950 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-navy-800">
            Search
          </button>
        </form>

        <div className="flex items-center justify-end gap-1">
          <Link
            href="/bulk-enquiry"
            className="mr-3 hidden border border-line-strong px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-navy-950 transition-colors duration-200 hover:border-navy-950 xl:inline-flex"
          >
            Get a Quote
          </Link>
          <Link href="/search" aria-label="Search" className={`hidden sm:inline-flex xl:hidden ${iconLinkClass}`}>
            <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" strokeWidth={1.5} />
          </Link>
          <Link href="/account" aria-label="Account" className={`hidden sm:inline-flex ${iconLinkClass}`}>
            <UserRound className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" strokeWidth={1.5} />
          </Link>
          <CartLink />
          <MobileNav links={mobileLinks} />
        </div>
      </Container>

      <div className="hidden border-t border-line bg-surface xl:block">
        <Container>
          <nav className="flex h-12 items-center justify-center gap-8 2xl:gap-11" aria-label="Main navigation">
            <Link href="/" className={navLinkClass}>Home</Link>
            <Link href="/corporate-gifting" className={navLinkClass}>Corporate Gifts</Link>
            <CollectionsDropdown />
            <Link href="/diwali-2026" className={`${navLinkClass} whitespace-nowrap`}>Diwali 2026</Link>
            <Link href="/gifting/employee-onboarding" className={`${navLinkClass} whitespace-nowrap`}>Welcome Kits</Link>
            <Link href="/custom-gifts" className={navLinkClass}>Custom Gifts</Link>
            <Link href="/blog" className={navLinkClass}>Gifting Guides</Link>
            <Link href="/about" className={navLinkClass}>About</Link>
            <Link href="/contact" className={navLinkClass}>Contact</Link>
          </nav>
        </Container>
      </div>
    </header>
  );
}
