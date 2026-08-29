import "server-only";

import { isEmailConfigured, siteUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { STORE_CONTACT } from "@/lib/config/store";
import { adminNotificationTemplate, confirmSignupEmailTemplate, orderEmailTemplate, type EmailOrder } from "@/lib/email/templates";

type SendEmailInput = {
  eventKey: string;
  type: string;
  to: string;
  subject: string;
  html: string;
  orderId?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendTransactionalEmail(input: SendEmailInput) {
  const from = process.env.EMAIL_FROM || `Gifta Guru <${STORE_CONTACT.email}>`;
  const apiKey = process.env.RESEND_API_KEY;

  const existing = await prisma.emailEvent.findUnique({ where: { eventKey: input.eventKey } }).catch(() => null);
  if (existing?.status === "sent" || existing?.status === "skipped") return existing;

  if (!isEmailConfigured()) {
    console.info(`Email skipped; RESEND_API_KEY is not configured. event=${input.eventKey}`);
    return prisma.emailEvent.upsert({
      where: { eventKey: input.eventKey },
      update: { status: "skipped", errorMessage: "RESEND_API_KEY is not configured." },
      create: {
        eventKey: input.eventKey,
        type: input.type,
        recipient: input.to,
        subject: input.subject,
        orderId: input.orderId,
        status: "skipped",
        errorMessage: "RESEND_API_KEY is not configured.",
      },
    });
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
    });
    const payload = (await response.json()) as { id?: string; message?: string };

    if (!response.ok) throw new Error(payload.message ?? "Resend rejected the email.");

    return prisma.emailEvent.upsert({
      where: { eventKey: input.eventKey },
      update: { status: "sent", providerId: payload.id, sentAt: new Date(), errorMessage: null },
      create: {
        eventKey: input.eventKey,
        type: input.type,
        recipient: input.to,
        subject: input.subject,
        orderId: input.orderId,
        status: "sent",
        providerId: payload.id,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error.";
    console.error(`Email failed. event=${input.eventKey} message=${message}`);
    return prisma.emailEvent.upsert({
      where: { eventKey: input.eventKey },
      update: { status: "failed", errorMessage: message },
      create: {
        eventKey: input.eventKey,
        type: input.type,
        recipient: input.to,
        subject: input.subject,
        orderId: input.orderId,
        status: "failed",
        errorMessage: message,
      },
    });
  }
}

export async function sendSignupConfirmationEmail(email: string, confirmationUrl: string) {
  return sendTransactionalEmail({
    eventKey: `signup:${email}:confirm`,
    type: "signup_confirmation",
    to: email,
    subject: "Confirm your Gifta Guru account",
    html: confirmSignupEmailTemplate(confirmationUrl),
  });
}

export async function sendOrderReceivedEmail(orderId: string) {
  const order = await getEmailOrder(orderId);
  if (!order) return null;

  return sendTransactionalEmail({
    eventKey: `order:${orderId}:received:customer`,
    type: "order_received",
    to: order.email,
    subject: `Order received ${order.orderNumber}`,
    orderId,
    html: orderEmailTemplate("Order received", "We have received your Gifta Guru order and will review it shortly.", order),
  });
}

export async function sendOrderStatusEmail(orderId: string, status: string) {
  const order = await getEmailOrder(orderId);
  if (!order) return null;

  const subject = `Order ${order.orderNumber}: ${status.replaceAll("_", " ")}`;
  return sendTransactionalEmail({
    eventKey: `order:${orderId}:status:${status}`,
    type: `order_${status}`,
    to: order.email,
    subject,
    orderId,
    html: orderEmailTemplate(subject, "Your order status has been updated.", order),
  });
}

export async function sendAdminNewOrderEmail(orderId: string) {
  const order = await getEmailOrder(orderId);
  if (!order) return null;

  return sendTransactionalEmail({
    eventKey: `order:${orderId}:received:admin`,
    type: "admin_new_order",
    to: process.env.ADMIN_EMAIL || STORE_CONTACT.email,
    subject: `New order ${order.orderNumber}`,
    orderId,
    html: adminNotificationTemplate("New order received", [
      `Order: ${order.orderNumber}`,
      `Customer: ${order.email} / ${order.phone}`,
      `Amount: ${formatNumber(order.total)}`,
      `Admin link: ${siteUrl()}/admin/orders/${order.orderNumber}`,
    ]),
  });
}

export async function sendBulkEnquiryEmail(enquiryId: string) {
  const enquiry = await prisma.bulkQuoteRequest.findUnique({ where: { id: enquiryId } });
  if (!enquiry) return null;

  await sendTransactionalEmail({
    eventKey: `bulk:${enquiryId}:customer`,
    type: "bulk_enquiry_received",
    to: enquiry.email,
    subject: "Bulk enquiry received",
    html: adminNotificationTemplate("Bulk enquiry received", [
      `Hi ${enquiry.fullName}, we have received your bulk gifting enquiry.`,
      "Our team will contact you shortly with next steps.",
    ]),
  });

  return sendTransactionalEmail({
    eventKey: `bulk:${enquiryId}:admin`,
    type: "admin_bulk_enquiry",
    to: process.env.ADMIN_EMAIL || STORE_CONTACT.email,
    subject: "New bulk enquiry",
    html: adminNotificationTemplate("New bulk enquiry", [
      `Customer: ${enquiry.fullName}`,
      `Company: ${enquiry.companyName ?? "N/A"}`,
      `Product: ${enquiry.productInterest ?? "N/A"}`,
      `Quantity: ${enquiry.quantity ?? "N/A"}`,
    ]),
  });
}

export async function sendCustomizationRequestEmail(orderId: string) {
  return sendTransactionalEmail({
    eventKey: `customization:${orderId}:admin`,
    type: "admin_customization_request",
    to: process.env.ADMIN_EMAIL || STORE_CONTACT.email,
    subject: "New customization request",
    orderId,
    html: adminNotificationTemplate("New customization request", [
      `Order ID: ${orderId}`,
      `Admin link: ${siteUrl()}/admin/orders/${orderId}`,
    ]),
  });
}

export async function sendLeadEmails(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return null;

  await sendTransactionalEmail({
    eventKey: `lead:${leadId}:customer`,
    type: "lead_customer_confirmation",
    to: lead.email,
    subject: "Thanks for contacting Gifta Guru",
    html: adminNotificationTemplate("Thanks for contacting Gifta Guru", [
      `Hi ${lead.name}, thank you for reaching out to Gifta Guru.`,
      "We have received your enquiry and our corporate gifting team will contact you shortly.",
      `Requirement: ${lead.message}`,
      lead.quantity ? `Estimated quantity: ${lead.quantity}` : "",
    ].filter(Boolean)),
  });

  return sendTransactionalEmail({
    eventKey: `lead:${leadId}:admin`,
    type: "admin_new_lead",
    to: process.env.ADMIN_EMAIL || STORE_CONTACT.email,
    subject: `New ${lead.type.replaceAll("_", " ")} lead`,
    html: adminNotificationTemplate("New lead received", [
      `Lead type: ${lead.type}`,
      `Source: ${lead.source}`,
      `Customer: ${lead.name}`,
      `Company: ${lead.company ?? "N/A"}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Quantity: ${lead.quantity ?? "N/A"}`,
      `Product: ${lead.productName ?? "N/A"}`,
      `Requirement: ${lead.message}`,
      `Admin link: ${siteUrl()}/admin/leads/${lead.id}`,
    ]),
  });
}

async function getEmailOrder(orderId: string): Promise<EmailOrder | null> {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: { items: true },
  });
  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    total: Number(order.total),
    email: order.email,
    phone: order.phone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    shippingAddress: order.shippingAddress as Record<string, unknown>,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
