import "server-only";

import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email/service";
import { logger } from "@/lib/logger";

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
  // Same replay guard the capture path has. Razorpay retries a delivery until
  // it sees a 2xx, and without this every retry wrote another status-history
  // row and released reserved stock again.
  const existingByEvent = webhookEventId
    ? await prisma.payment.findFirst({ where: { webhookEventId } })
    : null;
  if (existingByEvent) return existingByEvent;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) throw new Error("Payment record not found.");

  // A failure NEVER overrides a capture.
  //
  // Razorpay emits payment.failed per failed attempt, and a customer who fails
  // once (wrong OTP, declined card) then succeeds on the retry produces both
  // events against the same razorpay_order_id. Delivery order is not
  // guaranteed, so the failure can land after the capture. Without this guard
  // that flipped a genuinely paid order to payment_status = failed AND
  // released the reserved stock a second time -- money taken, order marked
  // failed, inventory wrong. The capture is the authoritative terminal state.
  if (payment.status === "captured" || payment.order.paymentStatus === "paid") {
    logger.warn("payment.failed_after_capture_ignored", {
      orderId: payment.orderId,
      razorpayOrderId,
      razorpayPaymentId,
    });
    return payment;
  }

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
