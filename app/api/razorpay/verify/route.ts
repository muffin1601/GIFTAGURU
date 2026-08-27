import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { isRazorpayConfigured } from "@/lib/env";
import { markPaymentCaptured } from "@/lib/orders/payment";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as VerifyBody;
  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
  }

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(body.razorpay_signature);
  const verified =
    expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!verified) return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });

  await markPaymentCaptured({
    razorpayOrderId: body.razorpay_order_id,
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySignature: body.razorpay_signature,
    rawResponse: body,
  });

  return NextResponse.json({ verified: true });
}
