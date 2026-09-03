import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { markPaymentCaptured, markPaymentFailed } from "@/lib/orders/payment";
import { logger, errorMessage } from "@/lib/logger";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  const verified =
    expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
  if (!verified) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

  const event = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string } };
      order?: { entity?: { id?: string } };
    };
    account_id?: string;
    created_at?: number;
  };

  const razorpayOrderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
  const razorpayPaymentId = event.payload?.payment?.entity?.id;
  const webhookEventId = `${event.event ?? "unknown"}:${razorpayOrderId ?? "no-order"}:${razorpayPaymentId ?? "no-payment"}:${event.created_at ?? ""}`;

  try {
    if (event.event === "payment.captured" && razorpayOrderId && razorpayPaymentId) {
      await markPaymentCaptured({ razorpayOrderId, razorpayPaymentId, webhookEventId, rawResponse: event });
    }

    if (event.event === "payment.failed" && razorpayOrderId) {
      await markPaymentFailed({ razorpayOrderId, razorpayPaymentId, webhookEventId, rawResponse: event });
    }
  } catch (error) {
    // "Payment record not found" means the event is not ours (another
    // integration on the same Razorpay account, or a test event). Retrying
    // that forever is pointless, so it is acknowledged and logged. Everything
    // else is a real failure and MUST return non-2xx so Razorpay redelivers --
    // silently swallowing it would lose a capture.
    const message = errorMessage(error);
    if (message.includes("Payment record not found")) {
      logger.warn("razorpay.webhook_unknown_order", { event: event.event, razorpayOrderId });
      return NextResponse.json({ received: true, ignored: true });
    }

    logger.error("razorpay.webhook_failed", { event: event.event, razorpayOrderId, message });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true, event: event.event ?? "unknown" });
}
