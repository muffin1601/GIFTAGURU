import Image from "next/image";
import { notFound } from "next/navigation";
import ActionForm, { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ActionForm";
import { updateDeliveryAction, updateOrderStatusAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { GIFT_WRAP_PRICE } from "@/lib/config/store";

const orderStatuses = ["pending", "confirmed", "paid", "processing", "ready_to_ship", "shipped", "out_for_delivery", "delivered", "fulfilled", "cancelled", "refunded"];
const deliveryStatuses = ["pending", "ready_to_ship", "shipped", "out_for_delivery", "delivered", "failed", "returned", "cancelled"];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      user: true,
      items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } },
      payments: { orderBy: { createdAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "desc" }, include: { actor: { select: { fullName: true } } } },
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as {
    name?: string;
    company?: string;
    phone?: string;
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  const giftWrapTotal = order.items.reduce((sum, item) => {
    const customization = item.customization as { giftWrap?: boolean; giftWrapPrice?: number } | null;
    return sum + (customization?.giftWrap ? Number(customization.giftWrapPrice ?? GIFT_WRAP_PRICE) : 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Order details</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">{order.orderNumber}</h1>
        <p className="mt-2 text-sm text-ink-600">{order.createdAt.toLocaleString("en-IN")}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Order information</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Info label="Order status" value={order.status} />
              <Info label="Payment status" value={order.paymentStatus} />
              <Info label="Delivery status" value={order.deliveryStatus} />
              <Info label="Payment ID" value={order.payments[0]?.razorpayPaymentId ?? "Pending"} />
              <Info label="Razorpay order" value={order.payments[0]?.razorpayOrderId ?? "Not created"} />
              <Info label="Total" value={formatPrice(Number(order.total))} />
            </dl>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Customer and delivery</h2>
            <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-navy-950">Customer</h3>
                <p className="mt-2">{address?.name ?? order.user?.fullName ?? "Guest"}</p>
                <p>{order.email}</p>
                <p>{order.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy-950">Delivery address</h3>
                <p className="mt-2">{address?.line1}</p>
                <p>{address?.city}, {address?.state} {address?.postalCode}</p>
                <p>{address?.country ?? "IN"}</p>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Order items</h2>
            <div className="mt-4 divide-y divide-line">
              {order.items.map((item) => {
                const customization = item.customization as {
                  personalizationText?: string | null;
                  logoUrl?: string | null;
                  logoFileName?: string | null;
                  giftWrap?: boolean;
                  giftWrapPrice?: number;
                } | null;
                const image = item.product?.images[0]?.url;
                return (
                  <div key={item.id} className="grid gap-4 py-4 md:grid-cols-[88px_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden border border-line bg-sunken">
                      {image ? <Image src={image} alt={item.productName} fill sizes="88px" className="object-contain p-2" /> : null}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-navy-950">{item.productName}</p>
                      <p className="text-ink-600">{item.variantName ?? "Standard"} · Qty {item.quantity}</p>
                      {customization?.personalizationText ? <p className="mt-1">Personalization: {customization.personalizationText}</p> : null}
                      {customization?.logoFileName ? <p>Logo: {customization.logoFileName}</p> : null}
                      {customization?.logoUrl ? <a href={customization.logoUrl} target="_blank" rel="noreferrer" className="font-semibold text-gold-700">View logo</a> : null}
                      {customization?.giftWrap ? <p>Gift wrap: {formatPrice(Number(customization.giftWrapPrice ?? GIFT_WRAP_PRICE))}</p> : null}
                    </div>
                    <div className="text-sm font-semibold text-navy-950">{formatPrice(Number(item.lineTotal))}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-2xl text-navy-950">Timeline</h2>
            <div className="mt-4 space-y-3">
              <div className="border border-line p-3 text-sm">
                <p className="font-semibold text-navy-950">Order placed</p>
                <p className="text-ink-600">{order.createdAt.toLocaleString("en-IN")}</p>
              </div>
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="border border-line p-3 text-sm">
                  <p className="font-semibold text-navy-950">{entry.toStatus.replaceAll("_", " ")}</p>
                  <p className="text-ink-600">{entry.createdAt.toLocaleString("en-IN")} · {entry.actor?.fullName ?? "System"}</p>
                  {entry.note ? <p className="mt-1 text-ink-700">{entry.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">Update status</h2>
            <ActionForm action={updateOrderStatusAction} submitLabel="Update order">
              <input type="hidden" name="orderId" value={order.id} />
              <AdminSelect name="status" defaultValue={order.status} options={orderStatuses} />
              <AdminTextarea name="note" rows={3} placeholder="Internal note" />
            </ActionForm>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-navy-950">Delivery management</h2>
            <ActionForm action={updateDeliveryAction} submitLabel="Save delivery">
              <input type="hidden" name="orderId" value={order.id} />
              <AdminSelect name="deliveryStatus" defaultValue={order.deliveryStatus} options={deliveryStatuses} />
              <AdminInput name="courierName" defaultValue={order.courierName ?? ""} placeholder="Courier name" />
              <AdminInput name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="Tracking number" />
              <AdminInput name="trackingUrl" defaultValue={order.trackingUrl ?? ""} placeholder="Tracking URL" />
              <AdminInput name="shippedAt" type="date" defaultValue={dateValue(order.shippedAt)} />
              <AdminInput name="estimatedDeliveryAt" type="date" defaultValue={dateValue(order.estimatedDeliveryAt)} />
              <AdminInput name="deliveredAt" type="date" defaultValue={dateValue(order.deliveredAt)} />
              <AdminTextarea name="deliveryNotes" rows={3} defaultValue={order.deliveryNotes ?? ""} placeholder="Internal delivery notes" />
            </ActionForm>
          </section>

          <section className="border border-navy-950 bg-navy-950 p-5 text-cream-100">
            <h2 className="font-display text-xl">Totals</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Product subtotal" value={formatPrice(Number(order.subtotal) - giftWrapTotal)} />
              <Row label="Gift wrap" value={formatPrice(giftWrapTotal)} />
              <Row label="Discount" value={formatPrice(Number(order.discountTotal))} />
              <Row label="Shipping" value={formatPrice(Number(order.shippingTotal))} />
              <Row label="GST" value={formatPrice(Number(order.taxTotal))} />
              <Row label="Final total" value={formatPrice(Number(order.total))} strong />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-500">{label}</dt>
      <dd className="mt-1 font-semibold text-navy-950">{value}</dd>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? "border-t border-white/15 pt-3 text-base font-semibold" : ""}`}><span>{label}</span><span>{value}</span></div>;
}

function dateValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}
