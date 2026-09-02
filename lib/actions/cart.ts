"use server";

import { revalidatePath } from "next/cache";
import {
  addToCart,
  clearCart,
  getCartView,
  removeCartItem,
  updateCartItemQuantity,
  mergeGuestCartIntoUser,
  CartError,
  EMPTY_CART,
  type CartView,
} from "@/lib/cart/service";
import { createClient } from "@/lib/supabase/server";
import { addToCartSchema, legacyCartSchema, lineQuantitySchema, lineSchema } from "@/lib/validations/cart";
import { logger, errorMessage } from "@/lib/logger";

/**
 * Thin server-action wrappers over the cart service.
 *
 * Every mutation returns the freshly-read cart so the client can replace its
 * state wholesale rather than trying to predict the outcome -- that is what
 * makes an optimistic update safe to roll back. `CartError` carries copy
 * meant for customers; anything else is logged and replaced with a generic
 * message so internal detail never reaches the browser.
 */

export type CartActionResult = { cart: CartView; error?: string };

async function run(operation: () => Promise<CartView>, event: string): Promise<CartActionResult> {
  try {
    const cart = await operation();
    // The header badge and the cart page are server-rendered from the same
    // source, so both have to be invalidated after a write.
    revalidatePath("/", "layout");
    return { cart };
  } catch (error) {
    if (error instanceof CartError) {
      return { cart: await safeRead(), error: error.message };
    }
    logger.error(event, { message: errorMessage(error) });
    return { cart: await safeRead(), error: "Something went wrong. Please try again." };
  }
}

/** A failed mutation still needs to hand back truthful state to roll back to. */
async function safeRead(): Promise<CartView> {
  return getCartView().catch(() => EMPTY_CART);
}

export async function getCartAction(): Promise<CartView> {
  return safeRead();
}

export async function addToCartAction(input: unknown): Promise<CartActionResult> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { cart: await safeRead(), error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  return run(() => addToCart(parsed.data), "cart.action.add_failed");
}

export async function updateCartQuantityAction(input: unknown): Promise<CartActionResult> {
  const parsed = lineQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return { cart: await safeRead(), error: parsed.error.issues[0]?.message ?? "Invalid quantity." };
  }
  return run(() => updateCartItemQuantity(parsed.data.lineId, parsed.data.quantity), "cart.action.update_failed");
}

export async function removeCartItemAction(input: unknown): Promise<CartActionResult> {
  const parsed = lineSchema.safeParse(input);
  if (!parsed.success) {
    return { cart: await safeRead(), error: "Invalid request." };
  }
  return run(() => removeCartItem(parsed.data.lineId), "cart.action.remove_failed");
}

export async function clearCartAction(): Promise<CartActionResult> {
  return run(() => clearCart(), "cart.action.clear_failed");
}

/**
 * One-time import of a cart left in localStorage by the previous client-only
 * implementation, so the change of architecture doesn't silently empty the
 * baskets of customers mid-shop.
 *
 * Each line goes through the ordinary `addToCart` path, so it is validated,
 * stock-checked and repriced like any other add -- the legacy payload is
 * treated as an untrusted request, never as restored state. Individual
 * failures (a product since archived, an item now out of stock) are skipped
 * rather than failing the whole import.
 */
export async function importLegacyCartAction(input: unknown): Promise<CartActionResult> {
  const parsed = legacyCartSchema.safeParse(input);
  if (!parsed.success) return { cart: await safeRead(), error: "Invalid request." };

  let imported = 0;
  for (const item of parsed.data.items) {
    try {
      await addToCart({
        productRef: item.id,
        quantity: item.quantity,
        customization: {
          personalizationText: item.personalizationText,
          logoUrl: item.logoUrl,
          logoFileName: item.logoFileName,
          giftWrap: item.giftWrap,
        },
      });
      imported += 1;
    } catch (error) {
      logger.warn("cart.legacy_import_line_skipped", {
        productRef: item.id,
        message: errorMessage(error),
      });
    }
  }

  logger.info("cart.legacy_import", { requested: parsed.data.items.length, imported });
  revalidatePath("/", "layout");
  return { cart: await safeRead() };
}

/**
 * Merges the guest cart after a session is established client-side.
 *
 * `loginAction` handles the password path server-side, but email confirmation
 * and magic links land on /auth/callback, which calls `setSession()` in the
 * browser -- no server action runs, so without this the guest cart would be
 * stranded. The user is read from the (now-current) session cookie rather
 * than accepted as a parameter, so this cannot be used to merge a cart into
 * someone else's account.
 */
export async function claimGuestCartAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await mergeGuestCartIntoUser(data.user.id);
    revalidatePath("/", "layout");
  } catch (error) {
    logger.error("cart.action.claim_failed", { message: errorMessage(error) });
  }
}
