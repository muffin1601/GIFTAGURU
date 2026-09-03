import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/account/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/env";
import { formatPrice } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) =>
    pageMetadata({
      title: "Order Received | Gifta Guru",
      description: "Your Gifta Guru order confirmation.",
      path: `/order-confirmation/${id}`,
      index: false,
    }),
  );
}

/**
 * Order details are shown ONLY to the account that owns the order.
 *
 * Order numbers are sequential (GG-<nextval>), so the number in the URL is not
 * a secret and cannot be treated as a bearer token -- rendering the order for
 * anyone who visits the path would be a walk-the-sequence IDOR exposing
 * addresses, totals and contact details. A guest therefore gets the
 * acknowledgement plus a pointer to /track-order, which requires the order
 * number AND the email together.
 */
export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = isDatabaseConfigured() ? await getSessionUser() : null;
  const order = user
    ? await prisma.order.findFirst({
        where: {
          orderNumber: id,
          OR: [{ userId: user.id }, { email: user.email ?? "" }],
        },
        select: {
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          deliveryStatus: true,
          createdAt: true,
          items: { select: { id: true, productName: true, quantity: true, lineTotal: true } },
        },
      })
    : null;

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 ring-1 ring-navy-950/5">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Order Received</p>
          <h1 className="mt-3 font-display text-4xl text-navy-950">We have your gifting request</h1>
          <p className="mt-4 text-ink-700">
            Reference: <span className="font-semibold text-navy-950">{id}</span>. A confirmation
            email is on its way. Payment and fulfilment status are verified server-side.
          </p>
        </div>

        {order ? (
          <div className="mt-8 border-t border-line pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="type-eyebrow">Summary</h2>
              <div className="flex flex-wrap gap-2">
                <StatusBadge kind="payment" value={order.paymentStatus} />
                <StatusBadge kind="delivery" value={order.deliveryStatus} />
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="text-ink-700">
                    {item.productName} &times; {item.quantity}
                  </span>
                  <span className="text-navy-950">{formatPrice(Number(item.lineTotal))}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between gap-4 border-t border-line pt-4">
              <span className="font-semibold text-navy-950">Total paid</span>
              <span className="font-display text-xl text-navy-950">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        ) : (
          <p className="mt-8 border-t border-line pt-6 text-center text-sm text-ink-700">
            Track this order any time with your order number and email on the{" "}
            <Link href="/track-order" className="link-underline text-navy-950">
              order tracking page
            </Link>
            .
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/shop">Continue Shopping</Button>
          {order ? (
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="btn btn-secondary"
            >
              View order
            </Link>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
