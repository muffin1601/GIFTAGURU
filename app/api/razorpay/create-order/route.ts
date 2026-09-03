import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { isDatabaseConfigured, isRazorpayConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { getActiveCartId } from "@/lib/cart/service";
import { logger, errorMessage } from "@/lib/logger";
import { groupIntoShipments, toAddressSnapshot, totalShipping } from "@/lib/checkout/shipments";
import { PERSONALIZATION_MAX_LENGTH } from "@/lib/config/store";
import { getStoreSettings } from "@/lib/data/store-settings";
import { resolveUnitPrice } from "@/lib/pricing";
import { isValidIndianPinCode } from "@/lib/services/delivery";
import { sendAdminNewOrderEmail, sendCustomizationRequestEmail, sendOrderReceivedEmail } from "@/lib/email/service";

interface CreateOrderBody {
  items?: {
    productId: string;
    quantity: number;
    /** Saved address this line ships to; absent means the primary address. */
    addressId?: string | null;
    personalizationText?: string;
    logoUrl?: string;
    logoFileName?: string;
    giftWrap?: boolean;
  }[];
  checkout?: Record<string, FormDataEntryValue | string>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * A checkout failure whose message is safe to show the customer.
 *
 * Previously these were plain `Error`s thrown outside any handler, so an
 * out-of-stock line surfaced as an unhandled 500 and the customer was told
 * "Unable to create payment order." with no indication of what to change.
 * Anything that is NOT a CheckoutError is logged and replaced with a generic
 * message, so internal detail still never reaches the browser.
 */
class CheckoutError extends Error {}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  try {
    return await handleCreateOrder(request);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Anything else is a genuine fault (inventory race lost, database
    // unavailable, Razorpay rejected the order). It is logged with detail and
    // answered with copy that gives the customer something to do.
    logger.error("checkout.create_order_failed", { message: errorMessage(error) });
    return NextResponse.json(
      { error: "We couldn't start your payment. Nothing has been charged - please try again in a moment." },
      { status: 500 },
    );
  }
}

async function handleCreateOrder(request: Request) {
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    throw new CheckoutError("Malformed request.");
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const checkout = body.checkout ?? {};
  const postalCode = text(checkout.postalCode);

  if (postalCode && !isValidIndianPinCode(postalCode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit Indian PIN code." }, { status: 400 });
  }

  const billingSameAsShipping = text(checkout.billingSameAsShipping) !== "false";
  const billingPostalCode = billingSameAsShipping ? postalCode : text(checkout.billingPostalCode);

  if (billingPostalCode && !isValidIndianPinCode(billingPostalCode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit Indian PIN code for the billing address." }, { status: 400 });
  }

  // Authoritative: whatever admin has configured in /admin/settings, not the
  // bundled defaults, governs what the customer is actually charged.
  const settings = await getStoreSettings();

  const invalidQuantity = body.items.some((item) => item.quantity < settings.minOrderQuantity);
  if (invalidQuantity) {
    return NextResponse.json({ error: settings.minOrderQuantityMessage }, { status: 400 });
  }

  const invalidPersonalization = body.items.some(
    (item) => text(item.personalizationText).length > PERSONALIZATION_MAX_LENGTH,
  );
  if (invalidPersonalization) {
    return NextResponse.json({ error: `Personalization text must be ${PERSONALIZATION_MAX_LENGTH} characters or less.` }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      orderId: `demo_${randomUUID()}`,
      message: "DATABASE_URL is not configured. Checkout is running in demo mode.",
    });
  }

  // Deduplicated: the cart legitimately holds several lines for the SAME
  // product when they carry different customizations (two engravings of one
  // pen). Counting raw refs against the fetched rows below then reported
  // "unavailable" and blocked checkout outright for those carts.
  const productRefs = [...new Set(body.items.map((item) => item.productId))];
  const productIds = productRefs.filter(isUuid);
  const productSlugs = productRefs.filter((ref) => !isUuid(ref));
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        ...(productIds.length > 0 ? [{ id: { in: productIds } }] : []),
        ...(productSlugs.length > 0 ? [{ slug: { in: productSlugs } }] : []),
      ],
    },
    include: {
      variants: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        take: 1,
        include: { inventory: true },
      },
      priceTiers: true,
    },
  });

  if (products.length !== productRefs.length) {
    return NextResponse.json({ error: "One or more cart items are unavailable." }, { status: 400 });
  }

  // Saved addresses the customer is allowed to route to. Scoped to the
  // signed-in profile, so an addressId belonging to anyone else resolves to
  // nothing and the line falls back to the primary destination rather than
  // leaking a stranger's address into this order.
  const sessionUser = await getSessionUser();
  const cartId = await getActiveCartId();
  const requestedAddressIds = [...new Set(body.items.map((item) => item.addressId).filter((id): id is string => Boolean(id)))];
  const savedAddresses =
    sessionUser && requestedAddressIds.length > 0
      ? await prisma.address.findMany({ where: { id: { in: requestedAddressIds }, profileId: sessionUser.id } })
      : [];

  // Stock is checked against the running total per variant, not per line, so
  // two customized lines of the same product cannot each independently "pass"
  // against the same units.
  const claimedPerVariant = new Map<string, number>();

  const lineItems = body.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId || candidate.slug === item.productId);
    if (!product) throw new CheckoutError("One or more cart items are unavailable.");
    const variant = product.variants[0];
    if (!variant) throw new CheckoutError(`${product.name} is not available for purchase right now.`);
    if (!variant.inventory) throw new CheckoutError(`${product.name} is not available for purchase right now.`);
    const quantity = Math.max(item.quantity, product.minOrderQuantity, settings.minOrderQuantity);
    const available = variant.inventory.quantityAvailable - variant.inventory.quantityReserved;
    const alreadyClaimed = claimedPerVariant.get(variant.id) ?? 0;
    if (available < alreadyClaimed + quantity) {
      throw new CheckoutError(`${product.name} has only ${Math.max(available, 0)} unit(s) available.`);
    }
    claimedPerVariant.set(variant.id, alreadyClaimed + quantity);
    const baseUnitPrice = Number(variant.priceOverride ?? product.basePrice);
    const tiers = product.priceTiers.map((tier) => ({ minQuantity: tier.minQuantity, unitPrice: Number(tier.unitPrice) }));
    const unitPrice = resolveUnitPrice(baseUnitPrice, tiers, quantity);
    const giftWrapTotal = item.giftWrap ? settings.giftWrapPrice : 0;
    return {
      product,
      variant,
      quantity,
      addressId: item.addressId ?? null,
      unitPrice,
      personalizationText: text(item.personalizationText),
      logoUrl: text(item.logoUrl),
      logoFileName: text(item.logoFileName),
      giftWrap: Boolean(item.giftWrap),
      giftWrapTotal,
      lineTotal: unitPrice * quantity + giftWrapTotal,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const primaryAddress = {
    name: text(checkout.name),
    company: text(checkout.company) || undefined,
    phone: text(checkout.phone),
    line1: text(checkout.address),
    city: text(checkout.city),
    state: text(checkout.state),
    postalCode: text(checkout.postalCode),
    country: "IN",
  };

  // One group per destination. Shipping is charged per destination and the
  // free-shipping threshold is evaluated against each destination's own
  // subtotal -- three cities is three deliveries to pay for.
  const shipmentGroups = groupIntoShipments({
    lines: lineItems.map((item) => ({ addressId: item.addressId, lineTotal: item.lineTotal, item })),
    addresses: new Map(
      savedAddresses.map((address) => [
        address.id,
        { ...toAddressSnapshot(address, text(checkout.company)), label: address.label },
      ]),
    ),
    primaryAddress,
    primaryLabel: null,
    settings,
  });

  const shippingTotal = totalShipping(shipmentGroups);
  const taxTotal = Math.round((subtotal * settings.gstRatePercent) / 100);
  const total = subtotal + shippingTotal + taxTotal;

  const dbOrder = await prisma.$transaction(async (tx) => {
    for (const item of lineItems) {
      const reserved = await tx.$queryRaw<Array<{ id: string }>>`
        update public.inventory
        set quantity_reserved = quantity_reserved + ${item.quantity}
        where variant_id = ${item.variant.id}::uuid
          and (quantity_available - quantity_reserved) >= ${item.quantity}
        returning id
      `;
      if (reserved.length !== 1) throw new Error(`${item.product.name} does not have enough inventory.`);
    }

    const created = await tx.order.create({
      data: {
        // Authoritative owner, taken from the session cookie and never from the
        // request body. Without it every order was orphaned and /account/orders
        // could only fall back to matching on the email typed into the form --
        // so a customer who checked out with a different address to the one
        // they registered with lost the order from their account entirely.
        userId: sessionUser?.id ?? null,
        email: text(checkout.email) || "guest@giftaguru.local",
        phone: text(checkout.phone) || "0000000000",
        // Retained as the order's primary destination even when the order
        // splits, so anything reading orders.shipping_address (admin lists,
        // invoices, existing emails) keeps working unchanged.
        shippingAddress: primaryAddress,
        billingAddress: billingSameAsShipping
          ? {
              name: text(checkout.name),
              company: text(checkout.company),
              phone: text(checkout.phone),
              line1: text(checkout.address),
              city: text(checkout.city),
              state: text(checkout.state),
              postalCode: text(checkout.postalCode),
              country: "IN",
            }
          : {
              name: text(checkout.billingName),
              company: text(checkout.company),
              phone: text(checkout.phone),
              line1: text(checkout.billingAddress),
              city: text(checkout.billingCity),
              state: text(checkout.billingState),
              postalCode: billingPostalCode,
              country: "IN",
            },
        subtotal,
        shippingTotal,
        taxTotal,
        total,
        currency: "INR",
        status: "pending",
        paymentStatus: "pending",
        notes: "Created from storefront checkout.",
        items: {
          create: lineItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variant.id,
            productName: item.product.name,
            variantName: item.variant.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            customization: {
              personalizationText: item.personalizationText || null,
              logoUrl: item.logoUrl || null,
              logoFileName: item.logoFileName || null,
              giftWrap: item.giftWrap,
              giftWrapPrice: item.giftWrap ? settings.giftWrapPrice : 0,
            },
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: created.id, toStatus: "pending", toPaymentStatus: "pending", toDeliveryStatus: "pending", note: "Order placed from storefront checkout." },
    });

    // Destinations are written after the items so each line can be pointed at
    // its shipment. Only recorded when the order actually splits: a
    // single-destination order keeps orders.shipping_address alone, so nothing
    // downstream has to special-case a one-row shipment table.
    if (shipmentGroups.length > 1) {
      for (const group of shipmentGroups) {
        const shipment = await tx.orderShipment.create({
          data: {
            orderId: created.id,
            label: group.label,
            // AddressSnapshot is a closed interface, so it has no string index
            // signature for Prisma's Json type to match; the shape is plain
            // JSON-safe data, hence the widening rather than a type change.
            address: { ...group.address } as Prisma.InputJsonObject,
            subtotal: group.subtotal,
            shippingTotal: group.shippingTotal,
          },
        });

        // Match on the same identity used to build the group. Two lines of the
        // same variant only ever differ by customization, which is already
        // folded into a single cart line, so this maps one-to-one.
        const itemIds = created.items
          .filter((candidate) =>
            group.items.some(
              (line) =>
                line.product.id === candidate.productId &&
                line.variant.id === candidate.variantId &&
                line.quantity === candidate.quantity,
            ),
          )
          .map((candidate) => candidate.id);

        if (itemIds.length > 0) {
          await tx.orderItem.updateMany({
            where: { id: { in: itemIds }, shipmentId: null },
            data: { shipmentId: shipment.id },
          });
        }
      }
    }

    for (const item of lineItems) {
      const orderItem = created.items.find((candidate) => candidate.productId === item.product.id && candidate.variantId === item.variant.id);
      if ((item.logoUrl || item.personalizationText) && orderItem) {
        await tx.customizationRequest.create({
          data: {
            productId: item.product.id,
            orderItemId: orderItem.id,
            companyName: text(checkout.company),
            logoUrl: item.logoUrl || null,
            instructions: item.personalizationText ? `Personalization: ${item.personalizationText}` : null,
            quantity: item.quantity,
            status: "pending",
          },
        });
      }
    }

    // The basket has been converted into an order and its stock is reserved,
    // so it must not remain addable a second time. Clearing it here -- inside
    // the same transaction, rather than relying on the browser calling
    // clearCart() after payment -- is what stops "abandon the Razorpay modal,
    // refresh, submit again" from creating a duplicate order that reserves the
    // same inventory twice.
    if (cartId) {
      await tx.cartItem.deleteMany({ where: { cartId } });
    }

    return created;
  });

  await Promise.all([
    sendOrderReceivedEmail(dbOrder.id),
    sendAdminNewOrderEmail(dbOrder.id),
    lineItems.some((item) => item.logoUrl || item.personalizationText) ? sendCustomizationRequestEmail(dbOrder.id) : Promise.resolve(null),
  ]);

  if (!isRazorpayConfigured()) {
    return NextResponse.json({
      demo: true,
      orderId: dbOrder.orderNumber,
      databaseOrderId: dbOrder.id,
      total,
      message: "Razorpay credentials are not configured. Order saved with pending payment status.",
    });
  }

  const trustedAmountPaise = Math.round(total * 100);

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: trustedAmountPaise,
    currency: "INR",
    receipt: dbOrder.orderNumber,
    notes: { source: "giftaguru_checkout", databaseOrderId: dbOrder.id },
  });

  await prisma.payment.create({
    data: {
      orderId: dbOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
      status: "created",
      rawResponse: JSON.parse(JSON.stringify(razorpayOrder)),
    },
  });

  return NextResponse.json({
    orderId: dbOrder.orderNumber,
    databaseOrderId: dbOrder.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
