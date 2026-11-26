import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, FilePlus2, Mail, PencilLine, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { buildProductWhere } from "@/lib/admin/products/query";
import type { ProductFilters } from "@/lib/admin/products/grid-schema";

export const metadata = { title: "Dashboard | Gifta Guru Admin" };

const productsHref = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value) as Array<[string, string]>);
  return `/admin/products${params.size ? `?${params}` : ""}`;
};

async function countProducts(filters: ProductFilters) {
  return prisma.product.count({ where: await buildProductWhere(filters) });
}

export default async function AdminPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    featuredProducts,
    missingImages,
    missingSpecs,
    missingDescription,
    incomplete,
    missingMeta,
    missingAlt,
    metaTooLong,
    totalCategories,
    activeCategories,
    byCategory,
    totalLeads,
    newLeads,
    totalQuotes,
    newQuotes,
    recentLeads,
    recentQuotes,
    recentlyAdded,
    recentlyUpdated,
    featuredList,
    totalOrders,
    pendingOrders,
    revenueMonth,
  ] = await Promise.all([
    prisma.product.count(),
    countProducts({ status: "active" }),
    countProducts({ status: "inactive" }),
    countProducts({ featured: "yes" }),
    countProducts({ quality: "missing-image" }),
    countProducts({ quality: "missing-specs" }),
    countProducts({ quality: "missing-description" }),
    countProducts({ quality: "incomplete" }),
    countProducts({ seo: "missing-meta" }),
    countProducts({ seo: "missing-alt" }),
    countProducts({ seo: "meta-too-long" }),
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.bulkQuoteRequest.count(),
    prisma.bulkQuoteRequest.count({ where: { status: "new" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, company: true, productName: true, type: true, status: true, createdAt: true } }),
    prisma.bulkQuoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, fullName: true, companyName: true, productInterest: true, status: true, createdAt: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, status: true, createdAt: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } }),
    prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, status: true, updatedAt: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } }),
    prisma.product.findMany({ where: { isFeatured: true }, orderBy: { name: "asc" }, take: 8, select: { id: true, name: true, status: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid", createdAt: { gte: startOfMonth } } }),
  ]);

  const categories = await prisma.category.findMany({ where: { id: { in: byCategory.map((row) => row.categoryId).filter((id): id is string => !!id) } }, select: { id: true, name: true } });
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const distribution = byCategory
    .map((row) => ({ id: row.categoryId, name: row.categoryId ? categoryNames.get(row.categoryId) ?? "Unknown" : "Uncategorised", count: row._count._all }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...distribution.map((row) => row.count));

  const enquiries = [
    ...recentLeads.map((lead) => ({ id: lead.id, href: `/admin/leads/${lead.id}`, who: lead.name, what: lead.company ?? lead.productName ?? lead.type.replaceAll("_", " "), status: lead.status, at: lead.createdAt, source: "Lead" })),
    ...recentQuotes.map((quote) => ({ id: quote.id, href: "/admin/bulk-enquiries", who: quote.fullName, what: quote.companyName ?? quote.productInterest ?? "Bulk enquiry", status: quote.status, at: quote.createdAt, source: "Bulk enquiry" })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6);

  const alerts = [
    { count: missingImages, label: "products have no image", href: productsHref({ quality: "missing-image" }) },
    { count: missingMeta, label: "products have no meta description (site or custom)", href: productsHref({ seo: "missing-meta" }) },
    { count: missingAlt, label: "primary images have no alt text", href: productsHref({ seo: "missing-alt" }) },
    { count: missingSpecs, label: "products have no specifications", href: productsHref({ quality: "missing-specs" }) },
    { count: missingDescription, label: "products have no short description", href: productsHref({ quality: "missing-description" }) },
    { count: metaTooLong, label: "meta descriptions are over 160 characters", href: productsHref({ seo: "meta-too-long" }) },
  ].filter((alert) => alert.count > 0);

  const date = (value: Date) => value.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-navy-950">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-600">Live figures from the catalogue and enquiry database. Click any number to see those records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new" className="btn btn-primary py-2"><FilePlus2 className="h-4 w-4" aria-hidden="true" /> Add product</Link>
          <Link href="/admin/products?edit=1" className="btn btn-secondary py-2"><PencilLine className="h-4 w-4" aria-hidden="true" /> Bulk editor</Link>
          <a href="/api/admin/products/export?format=xlsx" className="btn btn-secondary py-2"><Download className="h-4 w-4" aria-hidden="true" /> Export products</a>
          <Link href="/admin/products/bulk-price-update" className="btn btn-secondary py-2"><Upload className="h-4 w-4" aria-hidden="true" /> Import prices</Link>
          <Link href="/admin/leads" className="btn btn-secondary py-2"><Mail className="h-4 w-4" aria-hidden="true" /> Enquiries</Link>
        </div>
      </div>

      <section aria-labelledby="catalogue-heading" className="space-y-2">
        <h2 id="catalogue-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-500">Catalogue</h2>
        <div className="dash-grid">
          <Stat label="Total products" value={totalProducts} href={productsHref()} />
          <Stat label="Active (on website)" value={activeProducts} href={productsHref({ status: "active" })} tone="ok" />
          <Stat label="Inactive (draft / archived)" value={inactiveProducts} href={productsHref({ status: "inactive" })} />
          <Stat label="Featured" value={featuredProducts} href={productsHref({ featured: "yes" })} />
          <Stat label="Categories" value={totalCategories} note={`${activeCategories} active`} href="/admin/categories" />
          <Stat label="Missing images" value={missingImages} href={productsHref({ quality: "missing-image" })} tone={missingImages ? "warn" : "ok"} />
          <Stat label="No specifications" value={missingSpecs} href={productsHref({ quality: "missing-specs" })} tone={missingSpecs ? "warn" : "ok"} />
          <Stat label="Incomplete information" value={incomplete} note="image, specs or descriptions" href={productsHref({ quality: "incomplete" })} tone={incomplete ? "warn" : "ok"} />
          <Stat label="Missing SEO description" value={missingMeta} href={productsHref({ seo: "missing-meta" })} tone={missingMeta ? "warn" : "ok"} />
        </div>
      </section>

      <section aria-labelledby="enquiry-heading" className="space-y-2">
        <h2 id="enquiry-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-500">Enquiries &amp; orders</h2>
        <div className="dash-grid">
          <Stat label="Total enquiries" value={totalLeads + totalQuotes} note={`${totalLeads} leads · ${totalQuotes} bulk`} href="/admin/leads" />
          <Stat label="New leads (not contacted)" value={newLeads} href="/admin/leads?status=new" tone={newLeads ? "warn" : "ok"} />
          <Stat label="New bulk enquiries" value={newQuotes} href="/admin/bulk-enquiries" tone={newQuotes ? "warn" : "ok"} />
          <Stat label="Orders" value={totalOrders} href="/admin/orders" />
          <Stat label="Pending orders" value={pendingOrders} href="/admin/orders?status=pending" />
          <Stat label="Paid revenue this month" value={formatPrice(Number(revenueMonth._sum.total ?? 0))} href="/admin/payments" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="dash-card xl:col-span-2" aria-labelledby="quality-heading">
          <div className="dash-card-head">
            <h2 id="quality-heading">Product data quality</h2>
            <Link href={productsHref({ quality: "incomplete" })} className="text-xs font-semibold text-gold-700 hover:text-navy-950">Fix in bulk editor</Link>
          </div>
          {alerts.length ? (
            <ul className="dash-list">
              {alerts.map((alert) => (
                <li key={alert.label}>
                  <Link href={alert.href} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sunken">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--pg-warn)]" aria-hidden="true" />
                    <span><strong className="tabular-nums">{alert.count}</strong> {alert.label}</span>
                    <span className="ml-auto text-xs text-ink-500">Review →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-ink-600"><CheckCircle2 className="h-4 w-4 text-[var(--pg-ok)]" aria-hidden="true" /> No data quality issues found.</p>
          )}
        </section>

        <section className="dash-card" aria-labelledby="dist-heading">
          <div className="dash-card-head">
            <h2 id="dist-heading">Products by category</h2>
            <Link href="/admin/categories" className="text-xs font-semibold text-gold-700 hover:text-navy-950">Manage</Link>
          </div>
          <ul className="space-y-2.5 p-4">
            {distribution.map((row) => (
              <li key={row.id ?? "none"}>
                <Link href={productsHref({ category: row.id ?? "none" })} className="block text-sm hover:text-navy-950">
                  <span className="flex justify-between gap-2"><span className="truncate">{row.name}</span><span className="tabular-nums text-ink-600">{row.count}</span></span>
                  <span className="dash-bar mt-1 block" aria-hidden="true"><span style={{ width: `${(row.count / maxCount) * 100}%` }} /></span>
                </Link>
              </li>
            ))}
            {distribution.length === 0 ? <li className="text-sm text-ink-600">No products yet.</li> : null}
          </ul>
        </section>

        <section className="dash-card" aria-labelledby="enq-heading">
          <div className="dash-card-head">
            <h2 id="enq-heading">Recent enquiries</h2>
            <Link href="/admin/leads" className="text-xs font-semibold text-gold-700 hover:text-navy-950">View all</Link>
          </div>
          <ul className="dash-list">
            {enquiries.map((item) => (
              <li key={`${item.source}-${item.id}`}>
                <Link href={item.href} className="block px-4 py-2.5 text-sm hover:bg-sunken">
                  <span className="flex justify-between gap-2"><span className="truncate font-medium text-navy-950">{item.who}</span><span className="shrink-0 text-xs text-ink-500">{date(item.at)}</span></span>
                  <span className="flex justify-between gap-2 text-xs text-ink-600"><span className="truncate">{item.what}</span><span className="shrink-0">{item.source} · {item.status}</span></span>
                </Link>
              </li>
            ))}
            {enquiries.length === 0 ? <li className="px-4 py-6 text-sm text-ink-600">No enquiries yet.</li> : null}
          </ul>
        </section>

        <ProductList title="Recently added" items={recentlyAdded.map((product) => ({ ...product, when: date(product.createdAt) }))} href={productsHref()} />
        <ProductList title="Recently updated" items={recentlyUpdated.map((product) => ({ ...product, when: date(product.updatedAt) }))} href={productsHref()} />
        <ProductList title="Featured products" items={featuredList.map((product) => ({ ...product, when: product.status }))} href={productsHref({ featured: "yes" })} />
      </div>
    </div>
  );
}

function Stat({ label, value, href, note, tone }: { label: string; value: number | string; href?: string; note?: string; tone?: "warn" | "ok" }) {
  const body = (
    <>
      <p className="dash-stat-label">{label}</p>
      <p className="dash-stat-value">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
      {note ? <p className="dash-stat-note">{note}</p> : null}
    </>
  );
  return href ? <Link href={href} className="dash-stat" data-tone={tone}>{body}</Link> : <div className="dash-stat" data-tone={tone}>{body}</div>;
}

function ProductList({ title, items, href }: { title: string; items: Array<{ id: string; name: string; when: string; images: Array<{ url: string }> }>; href: string }) {
  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h2>{title}</h2>
        <Link href={href} className="text-xs font-semibold text-gold-700 hover:text-navy-950">Open table</Link>
      </div>
      <ul className="dash-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/products/${item.id}`} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-sunken">
              <span className="pg-thumb shrink-0">
                {item.images[0] ? <Image src={item.images[0].url} alt="" width={32} height={32} unoptimized className="size-full object-contain" /> : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="shrink-0 text-xs text-ink-500">{item.when}</span>
            </Link>
          </li>
        ))}
        {items.length === 0 ? <li className="px-4 py-6 text-sm text-ink-600">Nothing here yet.</li> : null}
      </ul>
    </section>
  );
}
