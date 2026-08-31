// These five are defaults only. The values that actually govern pricing and
// checkout come from lib/data/store-settings.ts (admin-configurable via
// /admin/settings) -- everything below is the fallback used before the store
// has been configured, or if the database is unreachable.
export const MIN_ORDER_QUANTITY = 5;
export const MIN_ORDER_QUANTITY_MESSAGE = "You must select at least 5 products.";

export const GIFT_WRAP_PRICE = 40;

export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_CHARGE = 500;

export const PERSONALIZATION_MAX_LENGTH = 10;

export const LOGO_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const LOGO_UPLOAD_ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export const STORE_CONTACT = {
  phone: "87507 08222",
  phoneHref: "+918750708222",
  email: "giftaguru27@gmail.com",
  whatsappNumber: "918750708222",
  address: "F90/1, Beside ESIC Hospital, Okhla Industrial Area Phase 1, New Delhi - 110020, India",
};

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${STORE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
