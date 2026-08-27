"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ChevronDown, CircleDollarSign, FolderTree, Gift, Home, Mail, PackageCheck, Settings, ShoppingBag, TicketPercent, UsersRound } from "lucide-react";
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
    title: "Store",
    links: [{ label: "Store Settings", href: "/admin/settings", Icon: Settings }],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-navy-950/10 bg-white lg:block">
        <AdminNavigation pathname={pathname} />
      </aside>
      <div>
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-950/10 bg-white px-4 lg:hidden">
          <Link href="/admin" className="font-display text-xl text-navy-950">Gifta Guru Admin</Link>
          <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950">
            Menu <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {open ? (
          <div className="border-b border-navy-950/10 bg-white lg:hidden">
            <AdminNavigation pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-7 p-5" aria-label="Admin navigation">
      <Link href="/admin" onClick={onNavigate} className="font-display text-2xl text-navy-950">Gifta Guru</Link>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{section.title}</p>
          <div className="mt-2 flex flex-col gap-1">
            {section.links.map(({ label, href, Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-navy-950 text-cream-100" : "text-navy-950 hover:bg-cream-100"}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
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
