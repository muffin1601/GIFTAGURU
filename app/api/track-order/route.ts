import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientKey, consume, tooManyRequests } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Order numbers are sequential (GG-<nextval>), so this lookup was cheaply
  // enumerable: given one customer's email address an attacker could walk the
  // sequence and read order totals, item names and delivery status. The pair
  // is still the credential -- this just makes guessing it impractical.
  const limit = consume(await clientKey("track-order"), 10, 60_000);
  if (!limit.ok) {
    return tooManyRequests("Too many tracking lookups. Please try again shortly.", limit.retryAfter);
  }

  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "Order number and email are required." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, email },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      deliveryStatus: true,
      courierName: true,
      trackingNumber: true,
      trackingUrl: true,
      estimatedDeliveryAt: true,
      deliveredAt: true,
      total: true,
      createdAt: true,
      items: { select: { productName: true, quantity: true } },
      statusHistory: { orderBy: { createdAt: "asc" }, select: { toStatus: true, toDeliveryStatus: true, createdAt: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ ...order, total: Number(order.total) });
}
