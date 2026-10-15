"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ChevronDown, CircleDollarSign, ClipboardList, FolderTree, Gift, Home, LogOut, Mail, MessageSquareQuote, PackageCheck, Settings, ShoppingBag, Store, TicketPercent, UsersRound } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

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
      { label: "Blog", href: "/admin/blog", Icon: ClipboardList },
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
    <div className="admin-experience min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="admin-sidebar hidden border-r border-navy-800 lg:block">
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
        <main className="admin-content px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-8 p-6" aria-label="Admin navigation">
      <Link href="/admin" onClick={onNavigate} className="admin-brand font-display text-xl">
        Gifta Guru
      </Link>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="admin-nav-label text-[0.625rem] font-semibold uppercase tracking-[0.16em]">
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
                  className={`admin-nav-link -mx-2 flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                    active
                      ? "font-medium"
                      : ""
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
      <div className="mt-auto border-t border-white/15 pt-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="admin-nav-action -mx-2 flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 hover:text-white"
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
          View storefront
        </Link>
        <form action={logoutAction} className="mt-1">
          <button
            type="submit"
            className="admin-nav-action -mx-2 flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}
