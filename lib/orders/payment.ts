import "server-only";

import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email/service";

export async function markPaymentCaptured({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  webhookEventId,
  rawResponse,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  webhookEventId?: string;
  rawResponse?: unknown;
}) {
  const existingByEvent = webhookEventId
    ? await prisma.payment.findFirst({ where: { webhookEventId } })
    : null;
  if (existingByEvent) return existingByEvent;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) throw new Error("Payment record not found.");

  if (payment.status === "captured" && payment.razorpayPaymentId === razorpayPaymentId) return payment;

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of payment.order.items) {
      if (!item.variantId) continue;
      const updatedInventory = await tx.$queryRaw<Array<{ id: string; quantity_available: number }>>`
        update public.inventory
        set quantity_available = greatest(quantity_available - ${item.quantity}, 0),
            quantity_reserved = greatest(quantity_reserved - ${item.quantity}, 0)
        where variant_id = ${item.variantId}::uuid
        returning id, quantity_available
      `;
      const inventory = updatedInventory[0];
      if (inventory) {
        await tx.inventoryAdjustment.create({
          data: {
            inventoryId: inventory.id,
            variantId: item.variantId,
            type: "order_fulfilled",
            quantityChange: -item.quantity,
            quantityAfter: inventory.quantity_available,
            reference: payment.order.orderNumber,
            reason: "Payment captured.",
          },
        });
      }
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        fromStatus: payment.order.status,
        toStatus: "confirmed",
        fromPaymentStatus: payment.order.paymentStatus,
        toPaymentStatus: "paid",
        fromDeliveryStatus: payment.order.deliveryStatus,
        toDeliveryStatus: payment.order.deliveryStatus,
        note: "Payment captured and inventory fulfilled.",
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "confirmed", paymentStatus: "paid" },
    });

    return tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        webhookEventId,
        status: "captured",
        rawResponse: rawResponse ? JSON.parse(JSON.stringify(rawResponse)) : payment.rawResponse,
      },
    });
  });

  await sendOrderStatusEmail(payment.orderId, "payment_successful");
  return updated;
}

export async function markPaymentFailed({
  razorpayOrderId,
  razorpayPaymentId,
  webhookEventId,
  rawResponse,
}: {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  webhookEventId?: string;
  rawResponse?: unknown;
}) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) throw new Error("Payment record not found.");

  const updated = await prisma.$transaction(async (tx) => {
    if (payment.order.paymentStatus !== "failed") {
      for (const item of payment.order.items) {
        if (!item.variantId) continue;
        await tx.$executeRaw`
          update public.inventory
          set quantity_reserved = greatest(quantity_reserved - ${item.quantity}, 0)
          where variant_id = ${item.variantId}::uuid
        `;
      }
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        fromStatus: payment.order.status,
        toStatus: payment.order.status,
        fromPaymentStatus: payment.order.paymentStatus,
        toPaymentStatus: "failed",
        note: "Payment failed. Reserved stock released.",
      },
    });

    await tx.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "failed" } });
    return tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId,
        webhookEventId,
        status: "failed",
        rawResponse: rawResponse ? JSON.parse(JSON.stringify(rawResponse)) : payment.rawResponse,
      },
    });
  });

  await sendOrderStatusEmail(payment.orderId, "payment_failed");
  return updated;
}
