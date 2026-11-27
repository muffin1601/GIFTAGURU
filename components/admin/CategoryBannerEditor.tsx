import Image from "next/image";
import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { updateCategoryBannerAction } from "@/lib/actions/content";
import { getCategoryBanner, type BannerCategory } from "@/lib/data/category-banner";

export default async function CategoryBannerEditor({ category }: { category?: BannerCategory }) {
  const categoryBanner = await getCategoryBanner(category);
  return (
    <>
      {categoryBanner.imageUrl && <div className={`relative mt-3 max-w-xl overflow-hidden rounded-lg bg-sunken ${category ? "aspect-[2/1]" : "aspect-[8/3]"}`}>
        <Image src={categoryBanner.imageUrl} alt={categoryBanner.label} fill sizes="(min-width: 640px) 36rem, 90vw" className={category ? "object-cover" : "object-contain"} />
      </div>}
      <ActionForm key={category?.slug ?? ""} action={updateCategoryBannerAction} submitLabel="Save category banner" className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="categorySlug" value={category?.slug ?? ""} />
        <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
          Upload banner image
          <input type="file" name="file" accept=".png,.jpg,.jpeg,.webp" className="field-input text-sm" />
          <span className="block text-xs font-normal text-ink-600">PNG, JPG or WebP, up to 4 MB. {category ? "Recommended size 1600 × 800 px (2:1). The image is shown as-is, so any wording in the artwork stays visible; the collection title appears below it." : "Recommended size 2400 × 900 px."}</span>
        </label>
        <label className="space-y-1 text-sm font-medium text-navy-950">
          Banner description
          <AdminInput name="label" required defaultValue={categoryBanner.label} />
        </label>
        <label className="space-y-1 text-sm font-medium text-navy-950">
          Banner destination
          <AdminInput name="linkUrl" required defaultValue={categoryBanner.linkUrl} />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
          <input type="checkbox" name="isPublished" value="true" defaultChecked={categoryBanner.isPublished} className="h-4 w-4 accent-navy-950" />
          Published on this page
        </label>
      </ActionForm>
    </>
  );
}
