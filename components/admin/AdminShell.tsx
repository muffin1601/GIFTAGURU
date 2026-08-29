"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ChevronDown, CircleDollarSign, ClipboardList, FolderTree, Gift, Home, Mail, MessageSquareQuote, PackageCheck, Settings, ShoppingBag, TicketPercent, UsersRound } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    title: "Dashboard",
    links: [{ label: "Overview", href: "/admin", Icon: Home }],
  },
  {
    title: "Catalog",
    links: [
      { label: "Products", href: "/admin/products", Icon: ShoppingBag },
      { label: "Categories", href: "/admin/categories", Icon: FolderTree },
      { label: "Collections", href: "/admin/collections", Icon: Gift },
      { label: "Inventory", href: "/admin/inventory", Icon: Boxes },
    ],
  },
  {
    title: "Sales",
    links: [
      { label: "Orders", href: "/admin/orders", Icon: PackageCheck },
      { label: "Payments", href: "/admin/payments", Icon: CircleDollarSign },
      { label: "Coupons", href: "/admin/coupons", Icon: TicketPercent },
    ],
  },
  {
    title: "Customers",
    links: [{ label: "Customers", href: "/admin/customers", Icon: UsersRound }],
  },
  {
    title: "Corporate",
    links: [
      { label: "Bulk Enquiries", href: "/admin/bulk-enquiries", Icon: Mail },
      { label: "Leads", href: "/admin/leads", Icon: UsersRound },
      { label: "Customizations", href: "/admin/customizations", Icon: Gift },
    ],
  },
  {
    title: "Marketing",
    links: [
      { label: "Email Campaigns", href: "/admin/email-campaigns", Icon: Mail },
      { label: "Subscribers", href: "/admin/subscribers", Icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "FAQs", href: "/admin/faqs", Icon: ClipboardList },
      { label: "Testimonials", href: "/admin/testimonials", Icon: MessageSquareQuote },
    ],
  },
  {
    title: "System",
    links: [
      { label: "Store Settings", href: "/admin/settings", Icon: Settings },
      { label: "Audit Log", href: "/admin/audit-logs", Icon: ClipboardList },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:block">
        <AdminNavigation pathname={pathname} />
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <Link href="/admin" className="font-display text-lg text-navy-950">
            Gifta Guru Admin
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="btn btn-secondary py-2"
          >
            Menu <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {open ? (
          <div className="border-b border-line bg-surface lg:hidden">
            <AdminNavigation pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
        <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-8 p-6" aria-label="Admin navigation">
      <Link href="/admin" onClick={onNavigate} className="font-display text-xl text-navy-950">
        Gifta Guru
      </Link>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {section.title}
          </p>
          <div className="mt-2.5 flex flex-col">
            {section.links.map(({ label, href, Icon }) => {
              const active =
                pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`-mx-2 flex items-center gap-3 border-l-2 px-4 py-2 text-sm transition-colors duration-200 ${
                    active
                      ? "border-gold-500 font-medium text-navy-950"
                      : "border-transparent text-ink-700 hover:text-navy-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
