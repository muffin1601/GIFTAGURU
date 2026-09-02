"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireProfileId } from "@/lib/auth/session";
import { NotAuthenticatedError } from "@/lib/auth/session";
import { logger, errorMessage } from "@/lib/logger";
import { z } from "zod";

/**
 * Wishlist mutations.
 *
 * The `@@unique([wishlistId, productId])` constraint already in the schema
 * does the heavy lifting: repeated clicks can't create duplicate rows even
 * when two requests race, because the second one loses at the database.
 */

export type WishlistActionState = {
  error?: string;
  /** Present after a toggle so the button can render the new state. */
  saved?: boolean;
  /** Signals the UI to send the customer to sign in. */
  requiresAuth?: boolean;
};

const productIdSchema = z.object({ productId: z.string().uuid() });

/** Finds or creates the customer's single wishlist. */
async function getWishlistId(profileId: string): Promise<string> {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: profileId },
    update: {},
    create: { userId: profileId },
    select: { id: true },
  });
  return wishlist.id;
}

export async function toggleWishlistAction(input: unknown): Promise<WishlistActionState> {
  const parsed = productIdSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };

  try {
    const profileId = await requireProfileId();
    const wishlistId = await getWishlistId(profileId);
    const { productId } = parsed.data;

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId, productId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/account/wishlist");
      return { saved: false };
    }

    // The product must exist and be sellable -- otherwise a crafted request
    // could pin archived or draft products into a wishlist.
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "active" },
      select: { id: true },
    });
    if (!product) return { error: "That product is no longer available." };

    try {
      await prisma.wishlistItem.create({ data: { wishlistId, productId } });
    } catch (error) {
      // P2002: the unique constraint caught a double-click that raced the
      // findUnique above. The desired end state already holds.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    }

    revalidatePath("/account/wishlist");
    return { saved: true };
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return { requiresAuth: true, error: "Sign in to save products to your wishlist." };
    }
    logger.error("wishlist.toggle_failed", { message: errorMessage(error) });
    return { error: "We couldn't update your wishlist. Please try again." };
  }
}

export async function removeWishlistItemAction(
  _state: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const parsed = productIdSchema.safeParse({ productId: String(formData.get("productId") ?? "") });
  if (!parsed.success) return { error: "Invalid request." };

  try {
    const profileId = await requireProfileId();
    const wishlistId = await getWishlistId(profileId);

    // deleteMany scoped by wishlistId: an id belonging to someone else's
    // wishlist matches nothing rather than deleting it.
    await prisma.wishlistItem.deleteMany({ where: { wishlistId, productId: parsed.data.productId } });

    revalidatePath("/account/wishlist");
    return {};
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return { requiresAuth: true };
    logger.error("wishlist.remove_failed", { message: errorMessage(error) });
    return { error: "We couldn't remove that item. Please try again." };
  }
}
