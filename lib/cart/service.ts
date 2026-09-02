import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";
import { getStoreSettings, type StoreSettings } from "@/lib/data/store-settings";
import { resolveUnitPrice } from "@/lib/pricing";
import { EMPTY_CART, type CartView, type CartViewItem } from "@/lib/cart/types";
import { customizationKey, normalizeCustomization, type CartCustomization } from "@/lib/cart/customization";
import { logger, errorMessage } from "@/lib/logger";

/**
 * The single source of truth for cart state.
 *
 * The cart was previously localStorage-only: unauthenticated by construction,
 * per-browser, lost on device change, and racing between tabs. Everything here
 * runs server-side against `carts`/`cart_items`, with the
 * `(cartId, variantId, customizationKey)` unique constraint as the backstop
 * that makes repeated adds idempotent even under concurrent submits.
 *
 * Prices are ALWAYS derived here from the product/variant rows -- a price that
 * arrives from the client is never read, only recomputed.
 */

export const CART_COOKIE = "gg_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export { EMPTY_CART } from "@/lib/cart/types";
export type { CartView, CartViewItem } from "@/lib/cart/types";

export class CartError extends Error {}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Locates the caller's active cart without creating anything or touching
 * cookies -- safe to call while rendering a server component, where cookie
 * writes are not permitted.
 *
 * A signed-in customer can transiently own more than one active cart (two
 * tabs, or a login that raced a guest add). Rather than lean on a partial
 * unique index Prisma cannot express, extra carts are folded into the newest
 * one on read, which is self-healing.
 */
async function findActiveCart(userId: string | null, sessionToken: string | null) {
  if (userId) {
    const carts = await prisma.cart.findMany({
      where: { userId, status: "active" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (carts.length === 0) return null;
    if (carts.length > 1) {
      await absorbCarts(carts[0]!.id, carts.slice(1).map((cart) => cart.id));
    }
    return carts[0]!.id;
  }

  if (!sessionToken) return null;
  const cart = await prisma.cart.findFirst({
    where: { sessionToken, status: "active", userId: null },
    select: { id: true },
  });
  return cart?.id ?? null;
}

/**
 * Creates the cart if it does not exist yet, minting and setting the guest
 * cookie when there is no signed-in user. Only callable from a server action
 * or route handler, because it may write a cookie.
 */
async function ensureCart(): Promise<string> {
  const userId = await currentUserId();
  const jar = await cookies();
  let sessionToken = jar.get(CART_COOKIE)?.value ?? null;

  const existing = await findActiveCart(userId, sessionToken);
  if (existing) return existing;

  if (userId) {
    const cart = await prisma.cart.create({ data: { userId, status: "active" } });
    return cart.id;
  }

  if (!sessionToken) {
    sessionToken = randomUUID();
    jar.set(CART_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  // A retried request can reach here twice with the same token; the unique
  // index on session_token turns the loser into a lookup rather than a
  // duplicate cart.
  try {
    const cart = await prisma.cart.create({ data: { sessionToken, status: "active" } });
    return cart.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.cart.findFirst({
        where: { sessionToken, status: "active" },
        select: { id: true },
      });
      if (raced) return raced.id;
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** Priced, stock-checked view of the current cart. Never writes. */
export async function getCartView(): Promise<CartView> {
  if (!isDatabaseConfigured()) return EMPTY_CART;

  try {
    const userId = await currentUserId();
    const jar = await cookies();
    const cartId = await findActiveCart(userId, jar.get(CART_COOKIE)?.value ?? null);
    if (!cartId) return EMPTY_CART;

    const [settings, items] = await Promise.all([
      getStoreSettings(),
      prisma.cartItem.findMany({
        where: { cartId },
        orderBy: { createdAt: "asc" },
        include: {
          variant: {
            include: {
              inventory: true,
              product: { include: { priceTiers: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
            },
          },
        },
      }),
    ]);

    return buildCartView(items, settings);
  } catch (error) {
    // Next signals "this route must render dynamically" by throwing from
    // cookies(). Swallowing that would silently bake an empty cart into a
    // statically-rendered page, so it has to propagate.
    if (isDynamicUsageSignal(error)) throw error;

    // Any genuine failure must never take down the header or a product page.
    logger.error("cart.read_failed", { message: errorMessage(error) });
    return EMPTY_CART;
  }
}

/**
 * Next's bailout-to-dynamic error is control flow, not a fault. It is
 * identified by its `digest` rather than by class, because the constructor
 * lives in an internal module with no stable public export.
 */
function isDynamicUsageSignal(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("DYNAMIC_SERVER_USAGE");
}

type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    variant: {
      include: {
        inventory: true;
        product: { include: { priceTiers: true; images: true } };
      };
    };
  };
}>;

function buildCartView(items: CartItemWithRelations[], settings: StoreSettings): CartView {
  const viewItems = items
    // An archived or deleted product leaves the line unrenderable; drop it from
    // the view rather than showing a broken row. It is removed for real by
    // `pruneUnavailableItems` on the next mutation.
    .filter((item) => item.variant.product.status === "active")
    .map((item): CartViewItem => {
      const product = item.variant.product;
      const customization = normalizeCustomization(item.customization as CartCustomization);
      const priceTiers = product.priceTiers.map((tier) => ({
        minQuantity: tier.minQuantity,
        unitPrice: Number(tier.unitPrice),
      }));
      const price = Number(item.variant.priceOverride ?? product.basePrice);
      const unitPrice = resolveUnitPrice(price, priceTiers, item.quantity);
      const giftWrapTotal = customization.giftWrap ? settings.giftWrapPrice : 0;
      const sellable = item.variant.inventory
        ? Math.max(item.variant.inventory.quantityAvailable - item.variant.inventory.quantityReserved, 0)
        : 0;

      return {
        lineId: item.id,
        productId: product.id,
        variantId: item.variantId,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url,
        price,
        priceTiers,
        quantity: item.quantity,
        minQuantity: Math.max(product.minOrderQuantity, settings.minOrderQuantity),
        unitPrice,
        lineTotal: unitPrice * item.quantity + giftWrapTotal,
        maxQuantity: sellable,
        exceedsStock: item.quantity > sellable,
        ...customization,
      };
    });

  const merchandiseSubtotal = viewItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const giftWrapTotal = viewItems.reduce((sum, item) => sum + (item.giftWrap ? settings.giftWrapPrice : 0), 0);

  return {
    items: viewItems,
    count: viewItems.reduce((sum, item) => sum + item.quantity, 0),
    merchandiseSubtotal,
    giftWrapTotal,
    subtotal: merchandiseSubtotal + giftWrapTotal,
  };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export interface AddToCartInput {
  /** Product id or slug -- the storefront routes by slug in several places. */
  productRef: string;
  /** Omitted by the storefront, which is single-variant; falls back to default. */
  variantId?: string;
  quantity?: number;
  customization?: CartCustomization;
}

export async function addToCart(input: AddToCartInput): Promise<CartView> {
  if (!isDatabaseConfigured()) throw new CartError("The store is temporarily unavailable. Please try again shortly.");

  const settings = await getStoreSettings();
  const { variant, product } = await resolveVariant(input.productRef, input.variantId);

  const floor = Math.max(product.minOrderQuantity, settings.minOrderQuantity);
  const requested = Math.max(input.quantity ?? floor, floor);
  const key = customizationKey(input.customization);
  const customization = normalizeCustomization(input.customization);
  const cartId = await ensureCart();

  const sellable = variant.inventory
    ? Math.max(variant.inventory.quantityAvailable - variant.inventory.quantityReserved, 0)
    : 0;
  if (sellable <= 0) throw new CartError(`${product.name} is currently out of stock.`);

  // The upsert is the whole point: the composite unique makes "add the same
  // line again" a quantity increment rather than a second row, atomically, so
  // a double-click or a retried request cannot duplicate it.
  //
  // `increment` is used rather than a read-then-write sum so two concurrent
  // adds both land instead of one overwriting the other. Clamping to stock
  // therefore happens in a follow-up write.
  try {
    await prisma.cartItem.upsert({
      where: { cartId_variantId_customizationKey: { cartId, variantId: variant.id, customizationKey: key } },
      create: {
        cartId,
        variantId: variant.id,
        quantity: Math.min(requested, sellable),
        customizationKey: key,
        customization: customization as Prisma.InputJsonValue,
      },
      update: { quantity: { increment: requested } },
    });
  } catch (error) {
    logger.error("cart.add_failed", { productId: product.id, variantId: variant.id, message: errorMessage(error) });
    throw new CartError("We couldn't add that to your cart. Please try again.");
  }

  await clampLineToStock(cartId, variant.id, key, sellable);
  await touchCart(cartId);

  logger.info("cart.item_added", { cartId, variantId: variant.id, quantity: requested });
  return getCartView();
}

/** Trims a line back to sellable stock after an unconditional increment. */
async function clampLineToStock(cartId: string, variantId: string, key: string, sellable: number) {
  await prisma.cartItem.updateMany({
    where: { cartId, variantId, customizationKey: key, quantity: { gt: sellable } },
    data: { quantity: sellable },
  });
}

export async function updateCartItemQuantity(lineId: string, quantity: number): Promise<CartView> {
  if (!isDatabaseConfigured()) throw new CartError("The store is temporarily unavailable. Please try again shortly.");

  const cartId = await requireOwnedCart(lineId);
  const settings = await getStoreSettings();

  const item = await prisma.cartItem.findUnique({
    where: { id: lineId },
    include: { variant: { include: { inventory: true, product: true } } },
  });
  if (!item) throw new CartError("That item is no longer in your cart.");

  // Dropping below the minimum is treated as "remove", which is what the
  // decrement control at quantity == minimum is actually asking for.
  const floor = Math.max(item.variant.product.minOrderQuantity, settings.minOrderQuantity);
  if (quantity < floor) {
    if (quantity <= 0) return removeCartItem(lineId);
    throw new CartError(settings.minOrderQuantityMessage);
  }

  const sellable = item.variant.inventory
    ? Math.max(item.variant.inventory.quantityAvailable - item.variant.inventory.quantityReserved, 0)
    : 0;
  if (quantity > sellable) throw new CartError(`Only ${sellable} unit(s) of ${item.variant.product.name} are available.`);

  await prisma.cartItem.update({ where: { id: lineId }, data: { quantity } });
  await touchCart(cartId);
  return getCartView();
}

export async function removeCartItem(lineId: string): Promise<CartView> {
  if (!isDatabaseConfigured()) throw new CartError("The store is temporarily unavailable. Please try again shortly.");

  const cartId = await requireOwnedCart(lineId);
  // deleteMany, not delete: a double-submitted remove must be a no-op rather
  // than a "record not found" error.
  await prisma.cartItem.deleteMany({ where: { id: lineId, cartId } });
  await touchCart(cartId);
  return getCartView();
}

export async function clearCart(): Promise<CartView> {
  if (!isDatabaseConfigured()) return EMPTY_CART;

  const userId = await currentUserId();
  const jar = await cookies();
  const cartId = await findActiveCart(userId, jar.get(CART_COOKIE)?.value ?? null);
  if (!cartId) return EMPTY_CART;

  await prisma.cartItem.deleteMany({ where: { cartId } });
  await touchCart(cartId);
  return EMPTY_CART;
}

/**
 * Ownership check for line-addressed mutations.
 *
 * Without this, `removeCartItem(someoneElsesLineId)` would be a textbook IDOR:
 * cart item ids are unguessable but not secret, and the client supplies them.
 * The cart is resolved from the session/cookie and the line must belong to it.
 */
async function requireOwnedCart(lineId: string): Promise<string> {
  const userId = await currentUserId();
  const jar = await cookies();
  const cartId = await findActiveCart(userId, jar.get(CART_COOKIE)?.value ?? null);
  if (!cartId) throw new CartError("Your cart session has expired. Please add the item again.");

  const owned = await prisma.cartItem.findFirst({ where: { id: lineId, cartId }, select: { id: true } });
  if (!owned) {
    logger.warn("cart.line_ownership_rejected", { cartId, lineId });
    throw new CartError("That item is no longer in your cart.");
  }
  return cartId;
}

async function touchCart(cartId: string) {
  await prisma.cart.update({ where: { id: cartId }, data: { updatedAt: new Date() } }).catch(() => null);
}

async function resolveVariant(productRef: string, variantId?: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productRef);

  const product = await prisma.product.findFirst({
    where: { status: "active", ...(isUuid ? { id: productRef } : { slug: productRef }) },
    include: {
      variants: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], include: { inventory: true } },
    },
  });
  if (!product) throw new CartError("That product is no longer available.");

  // An explicit variant must belong to the product -- otherwise a caller could
  // pair a cheap product with another product's variant.
  const variant = variantId
    ? product.variants.find((candidate) => candidate.id === variantId)
    : product.variants[0];
  if (!variant) throw new CartError("That option is no longer available.");

  return { product, variant };
}

/* ------------------------------------------------------------------ */
/* Merge on sign-in                                                    */
/* ------------------------------------------------------------------ */

/**
 * Folds the guest cart into the signed-in customer's cart and clears the guest
 * cookie. Called immediately after a successful login or confirmation, so a
 * basket built before signing in survives the transition.
 *
 * Matching lines have their quantities summed and clamped to stock; distinct
 * customizations stay distinct. Failure is swallowed: losing a guest cart is
 * bad, but blocking the login is worse.
 */
export async function mergeGuestCartIntoUser(userId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    const jar = await cookies();
    const sessionToken = jar.get(CART_COOKIE)?.value;
    if (!sessionToken) return;

    // The cookie is cleared unconditionally: whatever happens below, this
    // browser must stop presenting a guest identity now that it is signed in.
    jar.delete(CART_COOKIE);

    const guestCart = await prisma.cart.findFirst({
      where: { sessionToken, status: "active", userId: null },
      select: { id: true },
    });
    if (!guestCart) return;

    const userCartId = await findActiveCart(userId, null);
    if (!userCartId) {
      // No existing cart: claiming the guest cart outright is cheaper and
      // safer than copying every line across.
      await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId, sessionToken: null },
      });
      logger.info("cart.guest_cart_claimed", { userId, cartId: guestCart.id });
      return;
    }

    await absorbCarts(userCartId, [guestCart.id]);
    logger.info("cart.guest_cart_merged", { userId, into: userCartId });
  } catch (error) {
    logger.error("cart.merge_failed", { userId, message: errorMessage(error) });
  }
}

/**
 * Moves every line from `sourceIds` into `targetId`, summing quantities on
 * collision, then deletes the drained carts.
 *
 * Runs in one transaction so a failure can't leave lines duplicated across
 * both carts. Quantities are clamped to sellable stock, since two carts that
 * were each individually valid can sum past what remains.
 */
async function absorbCarts(targetId: string, sourceIds: string[]): Promise<void> {
  if (sourceIds.length === 0) return;

  await prisma.$transaction(async (tx) => {
    const sourceItems = await tx.cartItem.findMany({
      where: { cartId: { in: sourceIds } },
      include: { variant: { include: { inventory: true } } },
    });

    for (const item of sourceItems) {
      const sellable = item.variant.inventory
        ? Math.max(item.variant.inventory.quantityAvailable - item.variant.inventory.quantityReserved, 0)
        : 0;
      if (sellable <= 0) continue;

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_variantId_customizationKey: {
            cartId: targetId,
            variantId: item.variantId,
            customizationKey: item.customizationKey,
          },
        },
        select: { id: true, quantity: true },
      });

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(existing.quantity + item.quantity, sellable) },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: targetId,
            variantId: item.variantId,
            quantity: Math.min(item.quantity, sellable),
            customizationKey: item.customizationKey,
            customization: item.customization as Prisma.InputJsonValue,
          },
        });
      }
    }

    await tx.cart.deleteMany({ where: { id: { in: sourceIds } } });
  });
}
