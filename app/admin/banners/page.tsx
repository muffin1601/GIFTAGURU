import Image from "next/image";
import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { createHomeBannerAction, deleteHomeBannerAction, updateCategoryBannerAction, updateHomeBannerAction } from "@/lib/actions/content";
import { getCategoryBanner } from "@/lib/data/category-banner";
import { prisma } from "@/lib/prisma";

const imageHint = "PNG, JPG or WEBP, up to 4MB. Recommended 2400 × 900 px (8:3) so nothing is letterboxed.";

export default async function AdminBannersPage() {
  const [banners, categoryBanner] = await Promise.all([
    prisma.homeBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    getCategoryBanner(),
  ]);
  const publishedCount = banners.filter((banner) => banner.isPublished).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Content</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Banners</h1>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">Category page banner</h2>
        <p className="mt-1 text-sm text-ink-600">One banner appears on the category listing and every individual category page.</p>
        <div className="relative mt-3 aspect-[8/3] max-w-xl overflow-hidden rounded-lg bg-sunken">
          <Image src={categoryBanner.imageUrl} alt={categoryBanner.label} fill sizes="(min-width: 640px) 36rem, 90vw" className="object-contain" />
        </div>
        <ActionForm action={updateCategoryBannerAction} submitLabel="Save category banner" className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Banner description
            <AdminInput name="label" required defaultValue={categoryBanner.label} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Link
            <AdminInput name="linkUrl" required defaultValue={categoryBanner.linkUrl} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Replace image (optional)
            <input type="file" name="file" accept=".png,.jpg,.jpeg,.webp" className="field-input text-sm" />
            <span className="block text-xs font-normal text-ink-600">{imageHint}</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isPublished" value="true" defaultChecked={categoryBanner.isPublished} className="h-4 w-4 accent-navy-950" />
            Published on category pages
          </label>
        </ActionForm>
      </section>

      <div>
        <h2 className="font-display text-2xl text-navy-950">Homepage banners</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-600">
          Published banners rotate automatically in the homepage hero, lowest display order first, every 5 seconds.
          Each banner links to the page you set. If no banner is published, the four default collection banners are shown so the hero is never empty.
        </p>
        <p className="mt-2 text-sm font-medium text-navy-950">{publishedCount} of {banners.length} published</p>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">Add banner</h2>
        <ActionForm action={createHomeBannerAction} submitLabel="Add banner" className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Label
            <AdminInput name="label" required placeholder="e.g. Diwali gifting" />
            <span className="block text-xs font-normal text-ink-600">Shown under the slider and read by screen readers.</span>
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Link
            <AdminInput name="linkUrl" required placeholder="/categories/premium-gifts" />
            <span className="block text-xs font-normal text-ink-600">A site path starting with /, or a full https:// link.</span>
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Banner image
            <input type="file" name="file" accept=".png,.jpg,.jpeg,.webp" required className="field-input text-sm" />
            <span className="block text-xs font-normal text-ink-600">{imageHint}</span>
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Display order
            <AdminInput name="sortOrder" type="number" min={0} defaultValue={banners.length} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isPublished" value="true" defaultChecked className="h-4 w-4 accent-navy-950" />
            Published
          </label>
        </ActionForm>
      </section>

      {banners.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-600">No banners yet. The homepage is showing the default collection banners.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {banners.map((banner) => (
            <section key={banner.id} className="panel p-5">
              <div className="flex items-center justify-between gap-3">
                <span className={`badge ${banner.isPublished ? "badge-positive" : "badge-attention"}`}>
                  {banner.isPublished ? "Published" : "Hidden"}
                </span>
                <span className="text-xs text-ink-600">Order {banner.sortOrder}</span>
              </div>
              <div className="relative mt-3 aspect-[8/3] overflow-hidden rounded-lg bg-sunken">
                <Image src={banner.imageUrl} alt={banner.label} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain" />
              </div>
              <ActionForm action={updateHomeBannerAction} submitLabel="Save" className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={banner.id} />
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Label
                  <AdminInput name="label" required defaultValue={banner.label} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Link
                  <AdminInput name="linkUrl" required defaultValue={banner.linkUrl} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
                  Replace image (optional)
                  <input type="file" name="file" accept=".png,.jpg,.jpeg,.webp" className="field-input text-sm" />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Display order
                  <AdminInput name="sortOrder" type="number" min={0} defaultValue={banner.sortOrder} />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                  <input type="checkbox" name="isPublished" value="true" defaultChecked={banner.isPublished} className="h-4 w-4 accent-navy-950" />
                  Published
                </label>
              </ActionForm>
              <ActionForm
                action={deleteHomeBannerAction}
                submitLabel="Delete banner"
                confirmMessage="Delete this banner? This cannot be undone."
                className="mt-3 border-t border-line pt-3"
              >
                <input type="hidden" name="id" value={banner.id} />
              </ActionForm>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
