"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FolderTree,
  Gift,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Monitor,
  Moon,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  TicketPercent,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { useLocalSetting, usePrefersDark } from "@/components/admin/useLocalSetting";

type NavLink = { label: string; href: string; Icon?: LucideIcon; exact?: boolean };
type NavSection = { title: string; Icon: LucideIcon; links: NavLink[] };

const sections: NavSection[] = [
  { title: "Dashboard", Icon: LayoutDashboard, links: [{ label: "Overview", href: "/admin", exact: true }] },
  {
    title: "Products",
    Icon: ShoppingBag,
    links: [
      { label: "All Products", href: "/admin/products", exact: true },
      { label: "Add Product", href: "/admin/products/new" },
      { label: "Bulk Editor", href: "/admin/products?edit=1" },
      { label: "Import Prices", href: "/admin/products/bulk-price-update" },
      { label: "Inventory", href: "/admin/inventory", Icon: Boxes },
    ],
  },
  {
    title: "Catalogue",
    Icon: FolderTree,
    links: [
      { label: "Categories", href: "/admin/categories", Icon: FolderTree },
      { label: "Collections & Gift Kits", href: "/admin/collections", Icon: Gift },
    ],
  },
  {
    title: "Enquiries",
    Icon: Mail,
    links: [
      { label: "Leads", href: "/admin/leads", Icon: UsersRound },
      { label: "Bulk Enquiries", href: "/admin/bulk-enquiries", Icon: Mail },
      { label: "Customisations", href: "/admin/customizations", Icon: Gift },
    ],
  },
  {
    title: "Sales",
    Icon: PackageCheck,
    links: [
      { label: "Orders", href: "/admin/orders", Icon: PackageCheck },
      { label: "Payments", href: "/admin/payments", Icon: CircleDollarSign },
      { label: "Coupons", href: "/admin/coupons", Icon: TicketPercent },
      { label: "Customers", href: "/admin/customers", Icon: UsersRound },
    ],
  },
  {
    title: "Website Content",
    Icon: Images,
    links: [
      { label: "Homepage Banners", href: "/admin/banners", Icon: Images },
      { label: "FAQs", href: "/admin/faqs", Icon: ClipboardList },
      { label: "Testimonials", href: "/admin/testimonials", Icon: MessageSquareQuote },
      { label: "Blog", href: "/admin/blog", Icon: ClipboardList },
    ],
  },
  {
    title: "Marketing",
    Icon: BarChart3,
    links: [
      { label: "Email Campaigns", href: "/admin/email-campaigns", Icon: Mail },
      { label: "Subscribers", href: "/admin/subscribers", Icon: BarChart3 },
    ],
  },
  {
    title: "System",
    Icon: Settings,
    links: [
      { label: "Store Settings", href: "/admin/settings", Icon: Settings },
      { label: "Activity Log", href: "/admin/audit-logs", Icon: ClipboardList },
    ],
  },
];

const CRUMB_LABELS: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  new: "New",
  "bulk-price-update": "Import Prices",
  categories: "Categories",
  collections: "Collections",
  inventory: "Inventory",
  orders: "Orders",
  payments: "Payments",
  coupons: "Coupons",
  customers: "Customers",
  leads: "Leads",
  "bulk-enquiries": "Bulk Enquiries",
  "bulk-quotes": "Bulk Quotes",
  customizations: "Customisations",
  "customization-requests": "Customisation Requests",
  banners: "Homepage Banners",
  faqs: "FAQs",
  testimonials: "Testimonials",
  blog: "Blog",
  "email-campaigns": "Email Campaigns",
  subscribers: "Subscribers",
  settings: "Store Settings",
  "audit-logs": "Activity Log",
};

const SEARCH_SCOPES = [
  { value: "products", label: "Products", href: "/admin/products" },
  { value: "orders", label: "Orders", href: "/admin/orders" },
  { value: "leads", label: "Leads", href: "/admin/leads" },
] as const;

const THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof THEMES)[number];

function isActive(pathname: string, link: NavLink) {
  const path = link.href.split("?")[0];
  if (link.href.includes("?")) return false;
  return link.exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
}

export type ShellUser = { name: string; email: string; role: string };

export default function AdminShell({ children, user }: { children: React.ReactNode; user: ShellUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalSetting("gg-admin:sidebar", "open", ["open", "collapsed"] as const);
  const [theme, setTheme] = useLocalSetting<Theme>("gg-admin:theme", "light", THEMES);
  const prefersDark = usePrefersDark();
  const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  const [scope, setScope] = useState<(typeof SEARCH_SCOPES)[number]["value"]>("products");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses the global search from anywhere that is not a text field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || event.ctrlKey || event.metaKey) return;
      if (target.closest("input, textarea, select, [contenteditable=true], .pg-scroll")) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: CRUMB_LABELS[segment] ?? (index === segments.length - 1 ? "Details" : segment),
  }));
  const isCollapsed = collapsed === "collapsed";
  const ThemeIcon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <div className="admin-experience admin-shell-grid min-h-screen" data-theme={resolvedTheme} data-collapsed={isCollapsed}>
      <aside className="admin-sidebar hidden lg:block">
        <div className="admin-sidebar-inner">
          <AdminNavigation pathname={pathname} collapsed={isCollapsed} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="admin-topbar">
          <button type="button" className="admin-icon-btn lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="admin-icon-btn hidden lg:inline-grid"
            onClick={() => setCollapsed(isCollapsed ? "open" : "collapsed")}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <nav aria-label="Breadcrumb" className="admin-crumbs hidden md:flex">
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" /> : <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                {index === crumbs.length - 1 ? <span aria-current="page">{crumb.label}</span> : <Link href={crumb.href}>{crumb.label}</Link>}
              </span>
            ))}
          </nav>
          <form
            role="search"
            className="ml-auto flex flex-1 items-center justify-end gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              const q = searchRef.current?.value.trim();
              const target = SEARCH_SCOPES.find((item) => item.value === scope)!;
              router.push(q ? `${target.href}?q=${encodeURIComponent(q)}` : target.href);
            }}
          >
            <select value={scope} onChange={(event) => setScope(event.target.value as typeof scope)} className="field-input hidden w-auto py-1.5 text-sm sm:block" aria-label="Search in">
              {SEARCH_SCOPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <div className="admin-search">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input ref={searchRef} type="search" placeholder="Search…  ( / )" className="field-input py-1.5 text-sm" aria-label="Global search" />
            </div>
          </form>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])}
            aria-label={`Theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
          <div className="hidden text-right leading-tight xl:block">
            <p className="text-xs font-semibold text-navy-950">{user.name}</p>
            <p className="text-[0.6875rem] text-ink-500">{user.role === "super_admin" ? "Super Admin" : "Admin"}</p>
          </div>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <div className="admin-sidebar absolute inset-y-0 left-0 w-72 overflow-y-auto">
              <button type="button" className="absolute right-3 top-3 text-white/80" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <AdminNavigation pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="admin-content px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavigation({ pathname, collapsed, onNavigate }: { pathname: string; collapsed: boolean; onNavigate?: () => void }) {
  const activeSection = sections.find((section) => section.links.some((link) => isActive(pathname, link)))?.title;
  const [open, setOpen] = useState<Set<string>>(() => new Set(["Products", activeSection ?? ""]));

  return (
    <nav className="flex min-h-full flex-col gap-1 p-3" aria-label="Admin navigation">
      <Link href="/admin" onClick={onNavigate} className="admin-brand mb-3 block px-2 py-2 font-display text-lg" title="Gifta Guru admin">
        {collapsed ? "GG" : "Gifta Guru"}
      </Link>
      {sections.map((section) => {
        const expanded = open.has(section.title) || section.title === activeSection;
        const single = section.links.length === 1;
        if (collapsed) {
          const first = section.links[0];
          return (
            <Link
              key={section.title}
              href={first.href}
              onClick={onNavigate}
              title={section.title}
              aria-label={section.title}
              aria-current={section.title === activeSection ? "page" : undefined}
              className="admin-nav-link flex justify-center px-2 py-2"
            >
              <section.Icon className="h-4 w-4" aria-hidden="true" />
            </Link>
          );
        }
        if (single) {
          const link = section.links[0];
          return (
            <Link
              key={section.title}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive(pathname, link) ? "page" : undefined}
              className="admin-nav-link flex items-center gap-3 px-2 py-2 text-sm"
            >
              <section.Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {section.title}
            </Link>
          );
        }
        return (
          <div key={section.title}>
            <button
              type="button"
              className="admin-group-toggle admin-nav-link text-sm"
              aria-expanded={expanded}
              onClick={() =>
                setOpen((current) => {
                  const next = new Set(current);
                  if (next.has(section.title)) next.delete(section.title);
                  else next.add(section.title);
                  return next;
                })
              }
            >
              <span className="flex items-center gap-3 py-1">
                <section.Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {section.title}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "" : "-rotate-90"}`} aria-hidden="true" />
            </button>
            {expanded ? (
              <div className="mt-0.5 flex flex-col">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={isActive(pathname, link) ? "page" : undefined}
                    className="admin-nav-link admin-nav-sub py-1.5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="mt-auto border-t border-white/15 pt-3">
        <Link href="/" onClick={onNavigate} className="admin-nav-action flex items-center gap-3 px-2 py-2 text-sm hover:text-white" title="View storefront">
          <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
          {collapsed ? <span className="sr-only">View storefront</span> : "View storefront"}
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="admin-nav-action flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:text-white" title="Log out">
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {collapsed ? <span className="sr-only">Log out</span> : "Log out"}
          </button>
        </form>
      </div>
    </nav>
  );
}
