import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { updateStoreSettingsAction } from "@/lib/actions/admin";
import { getStoreSettings } from "@/lib/data/store-settings";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Store</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Store settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          These values are authoritative: the product page, cart, checkout and the payment order
          created with Razorpay all read the same numbers saved here.
        </p>
      </div>

      <section className="panel p-5">
        <ActionForm action={updateStoreSettingsAction} submitLabel="Save settings" className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Minimum order quantity
            <AdminInput name="minimum_quantity" type="number" min={1} required defaultValue={settings.minOrderQuantity} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Gift wrap price (INR)
            <AdminInput name="gift_wrap_price" type="number" min={0} step="0.01" required defaultValue={settings.giftWrapPrice} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Free shipping threshold (INR)
            <AdminInput name="free_shipping_threshold" type="number" min={0} step="0.01" required defaultValue={settings.freeShippingThreshold} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Shipping charge below threshold (INR)
            <AdminInput name="shipping_charge" type="number" min={0} step="0.01" required defaultValue={settings.shippingCharge} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 md:col-span-2">
            Shipping message (shown on the product page)
            <AdminInput name="shipping_message" defaultValue={settings.shippingMessage} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 md:col-span-2">
            Shipping timeline (shown on the product page)
            <AdminInput name="shipping_timeline" defaultValue={settings.shippingTimeline} />
          </label>
        </ActionForm>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-navy-950">Store identity &amp; contact</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          Business name, phone, WhatsApp number and support email are set in{" "}
          <code className="text-xs">lib/config/store.ts</code> rather than here, because they&apos;re
          embedded in metadata and transactional email templates at render time, not values a
          storefront page reads at runtime. Ask your developer to update that file to change
          them.
        </p>
      </section>
    </div>
  );
}
