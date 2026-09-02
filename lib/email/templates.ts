import { STORE_CONTACT } from "@/lib/config/store";
import { siteUrl } from "@/lib/env";
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

// Mirrors the storefront's design tokens (app/globals.css). Email clients
// ignore CSS variables, so the values are inlined directly.
const COLOR = {
  canvas: "#fbf9f5",
  surface: "#ffffff",
  navy: "#0a1a30",
  navyLight: "#12325f",
  gold: "#8f6d16",
  ink900: "#16181b",
  ink700: "#4a4d53",
  ink500: "#74787e",
  line: "#e7e1d5",
};

// Serif fallback stack -- email clients can't load Fraunces, so this
// approximates the same editorial feel using fonts every client already has.
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_SANS = "Arial, Helvetica, sans-serif";

const LOGO_URL = `${siteUrl()}/SBanners/SBanners/NEW%20LOGO.png`;

function shell(eyebrow: string, title: string, body: string) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${COLOR.canvas};font-family:${FONT_SANS};color:${COLOR.ink900};-webkit-font-smoothing:antialiased">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.canvas};padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.surface};border:1px solid ${COLOR.line}">
            <tr>
              <td style="padding:32px 40px 24px;border-bottom:1px solid ${COLOR.line}">
                <img src="${LOGO_URL}" alt="Gifta Guru" height="40" style="height:40px;width:auto;display:block" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 8px">
                <p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${COLOR.gold}">
                  ${eyebrow}
                </p>
                <h1 style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-weight:400;font-size:28px;line-height:1.25;color:${COLOR.navy}">
                  ${title}
                </h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px">
                <p style="margin:0;font-family:${FONT_SANS};font-size:13px;line-height:1.7;color:${COLOR.ink500};border-top:1px solid ${COLOR.line};padding-top:20px">
                  Need help? WhatsApp or call <a href="tel:${STORE_CONTACT.phoneHref}" style="color:${COLOR.ink700};text-decoration:underline">+91 ${STORE_CONTACT.phone}</a>
                  or email <a href="mailto:${STORE_CONTACT.email}" style="color:${COLOR.ink700};text-decoration:underline">${STORE_CONTACT.email}</a>.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:${FONT_SANS};font-size:12px;color:${COLOR.ink500}">
            Gifta Guru &middot; ${STORE_CONTACT.address}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * adminNotificationTemplate's `lines` and orderEmailTemplate's order data
 * both embed customer-supplied text (lead name, message, enquiry details,
 * courier/tracking entries, ...) straight into the email HTML. Callers must
 * escape any *interpolated* customer value with this before building a line
 * -- e.g. `` `Name: ${escapeHtml(lead.name)}` `` -- since the line itself is
 * still allowed to carry trusted markup like `<strong>`.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:15px;line-height:1.7;color:${COLOR.ink700}">${text}</p>`;
}

function button(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr>
        <td style="background:${COLOR.navy}">
          <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONT_SANS};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;text-decoration:none">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function orderRows(order: EmailOrder) {
  const items = order.items ?? [];
  if (items.length === 0) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-family:${FONT_SANS};font-size:14px;border-top:1px solid ${COLOR.line}">
      ${items
        .map(
          (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${COLOR.line};color:${COLOR.ink700}">${escapeHtml(item.productName)} &times; ${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid ${COLOR.line};text-align:right;color:${COLOR.navy};font-weight:700">${formatPrice(item.lineTotal)}</td>
        </tr>`,
        )
        .join("")}
    </table>`;
}

export function orderEmailTemplate(title: string, intro: string, order: EmailOrder) {
  const tracking = order.trackingUrl ? button("Track shipment", order.trackingUrl) : "";

  return shell(
    "Order Update",
    title,
    `
    ${paragraph(intro)}
    ${paragraph(`<strong style="color:${COLOR.navy}">Order:</strong> ${order.orderNumber}`)}
    ${orderRows(order)}
    <p style="margin:16px 0 0;font-family:${FONT_DISPLAY};font-size:20px;color:${COLOR.navy}">
      Total: ${formatPrice(order.total)}
    </p>
    ${order.courierName ? paragraph(`<strong style="color:${COLOR.navy}">Courier:</strong> ${escapeHtml(order.courierName)}`) : ""}
    ${order.trackingNumber ? paragraph(`<strong style="color:${COLOR.navy}">Tracking:</strong> ${escapeHtml(order.trackingNumber)}`) : ""}
    ${tracking}
  `,
  );
}

export function confirmSignupEmailTemplate(confirmationUrl: string) {
  return shell(
    "Welcome",
    "Confirm your account",
    `
    ${paragraph("Thanks for creating a Gifta Guru business gifting account. Confirm your email to activate faster checkout and quotes.")}
    ${button("Confirm account", confirmationUrl)}
    <p style="margin:8px 0 0;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${COLOR.ink500}">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${confirmationUrl}" style="color:${COLOR.ink500};word-break:break-all">${confirmationUrl}</a>
    </p>
  `,
  );
}

export function resetPasswordEmailTemplate(resetUrl: string) {
  return shell(
    "Account Security",
    "Reset your password",
    `
    ${paragraph("We received a request to reset the password on your Gifta Guru account. Choose a new password using the link below.")}
    ${button("Reset password", resetUrl)}
    ${paragraph(`<span style="color:${COLOR.ink500}">This link can only be used once, and expires in 60 minutes.</span>`)}
    ${paragraph(`<span style="color:${COLOR.ink500}">If you didn't request this, you can safely ignore this email &mdash; your password will stay as it is.</span>`)}
    <p style="margin:8px 0 0;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${COLOR.ink500}">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetUrl}" style="color:${COLOR.ink500};word-break:break-all">${resetUrl}</a>
    </p>
  `,
  );
}

/**
 * Customer-facing notice, in the same shell as every other email.
 *
 * Distinct from `adminNotificationTemplate` purely because of the eyebrow:
 * customer confirmations were previously rendered with an "Admin Notification"
 * label, which is internal wording no customer should ever see.
 */
export function customerNoticeTemplate(eyebrow: string, title: string, lines: string[]) {
  return shell(eyebrow, title, lines.map((line) => paragraph(line)).join(""));
}

export function adminNotificationTemplate(title: string, lines: string[]) {
  return shell(
    "Admin Notification",
    title,
    lines.map((line) => paragraph(line)).join(""),
  );
}
