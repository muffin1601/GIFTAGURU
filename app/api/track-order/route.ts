import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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
