import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AccountBreadcrumb from "@/components/account/AccountBreadcrumb";
import StatusBadge from "@/components/account/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Orders | Gifta Guru",
  description: "Track your Gifta Guru orders and payment status.",
  path: "/account/orders",
  index: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await prisma.order.findMany({
    // Matched on email as well as userId so orders placed as a guest before
    // signing up still appear once the customer has an account.
    where: { OR: [{ userId: user.id }, { email: user.email ?? "" }] },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { productName: true, quantity: true } } },
  });

  return (
    <Container className="py-12 sm:py-16">
      <AccountBreadcrumb current="Orders" />
      <h1 className="type-h1 mt-4">Orders</h1>
      <p className="type-lead mt-4 max-w-2xl">Every order placed with this account, newest first.</p>

      {orders.length === 0 ? (
        <div className="panel mt-10 p-10 text-center">
          <Package className="mx-auto h-6 w-6 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="type-h3 mt-4">No orders yet</h2>
          <p className="type-body mx-auto mt-3 max-w-md">
            When you place an order it will appear here with live payment and delivery status.
          </p>
          <Button href="/shop" className="mt-7">
            Start shopping
          </Button>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const summary = order.items.map((item) => item.productName).slice(0, 2).join(", ");

            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="panel block p-6 transition-colors duration-200 hover:border-line-strong"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-navy-950">{order.orderNumber}</p>
                      <p className="type-meta mt-1">
                        {dateFormatter.format(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"}
                      </p>
                      {summary ? (
                        <p className="type-body mt-2 truncate text-sm">
                          {summary}
                          {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <p className="font-display text-xl text-navy-950">{formatPrice(Number(order.total))}</p>
                      <div className="mt-2.5 flex flex-wrap justify-end gap-2">
                        <StatusBadge kind="payment" value={order.paymentStatus} />
                        <StatusBadge kind="delivery" value={order.deliveryStatus} />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
