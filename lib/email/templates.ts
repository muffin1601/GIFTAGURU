import { STORE_CONTACT } from "@/lib/config/store";
import { formatPrice } from "@/lib/utils";

export type EmailOrder = {
  orderNumber: string;
  total: number;
  email: string;
  phone: string;
  status?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  items?: { productName: string; quantity: number; lineTotal: number }[];
};

function shell(title: string, body: string) {
  return `
  <div style="margin:0;padding:0;background:#f7f1e6;font-family:Arial,sans-serif;color:#122033">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px">
      <div style="background:#0f2038;color:#fff;border-radius:8px 8px 0 0;padding:22px">
        <h1 style="margin:0;font-size:24px;line-height:1.2">Gifta Guru</h1>
      </div>
      <div style="background:#fff;border-radius:0 0 8px 8px;padding:24px">
        <h2 style="margin:0 0 14px;font-size:22px;color:#0f2038">${title}</h2>
        ${body}
        <hr style="border:0;border-top:1px solid #eee;margin:24px 0" />
        <p style="margin:0;font-size:13px;color:#637083">Need help? WhatsApp/Call +91 ${STORE_CONTACT.phone} or email ${STORE_CONTACT.email}.</p>
      </div>
    </div>
  </div>`;
}

function orderRows(order: EmailOrder) {
  const items = order.items ?? [];
  if (items.length === 0) return "";
  return `
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
      ${items.map((item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee">${item.productName} x ${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.lineTotal)}</td>
        </tr>
      `).join("")}
    </table>`;
}

export function orderEmailTemplate(title: string, intro: string, order: EmailOrder) {
  const tracking = order.trackingUrl
    ? `<p><a href="${order.trackingUrl}" style="display:inline-block;background:#0f2038;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px">Track shipment</a></p>`
    : "";

  return shell(title, `
    <p style="font-size:15px;line-height:1.7">${intro}</p>
    <p style="font-size:15px"><strong>Order:</strong> ${order.orderNumber}</p>
    ${orderRows(order)}
    <p style="font-size:18px"><strong>Total:</strong> ${formatPrice(order.total)}</p>
    ${order.courierName ? `<p style="font-size:14px"><strong>Courier:</strong> ${order.courierName}</p>` : ""}
    ${order.trackingNumber ? `<p style="font-size:14px"><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ""}
    ${tracking}
  `);
}

export function confirmSignupEmailTemplate(confirmationUrl: string) {
  return shell("Confirm your account", `
    <p style="font-size:15px;line-height:1.7">Thanks for creating a Gifta Guru business gifting account. Confirm your email to activate faster checkout and quotes.</p>
    <p style="margin:22px 0">
      <a href="${confirmationUrl}" style="display:inline-block;background:#0f2038;color:#fff;text-decoration:none;border-radius:999px;padding:12px 24px;font-size:15px">Confirm account</a>
    </p>
    <p style="font-size:13px;color:#637083">If the button doesn't work, copy and paste this link into your browser:<br />${confirmationUrl}</p>
  `);
}

export function adminNotificationTemplate(title: string, lines: string[]) {
  return shell(title, `
    ${lines.map((line) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.6">${line}</p>`).join("")}
  `);
}
