import ActionForm, { AdminInput } from "@/components/admin/ActionForm";
import { updateStoreSettingsAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY, STORE_CONTACT } from "@/lib/config/store";
import { DELIVERY_WINDOW } from "@/lib/services/delivery";

const defaults = {
  store_name: "Gifta Guru",
  contact_phone: STORE_CONTACT.phone,
  whatsapp_number: STORE_CONTACT.whatsappNumber,
  support_email: STORE_CONTACT.email,
  minimum_quantity: MIN_ORDER_QUANTITY,
  gift_wrap_price: GIFT_WRAP_PRICE,
  shipping_message: "Delivery available across India",
  shipping_timeline: DELIVERY_WINDOW,
};

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSetting.findMany();
  const values = Object.fromEntries(settings.map((setting) => [setting.key, String(setting.value)]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Store</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Store settings</h1>
      </div>
      <section className="panel p-5">
        <ActionForm action={updateStoreSettingsAction} submitLabel="Save settings" className="grid gap-4 md:grid-cols-2">
          {Object.entries(defaults).map(([key, fallback]) => (
            <label key={key} className="space-y-1 text-sm font-medium text-navy-950">
              {key.replaceAll("_", " ")}
              <AdminInput name={key} defaultValue={values[key] ?? fallback} />
            </label>
          ))}
        </ActionForm>
      </section>
    </div>
  );
}
