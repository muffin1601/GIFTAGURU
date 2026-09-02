import "server-only";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/env";

/**
 * Read-only wishlist lookups for server rendering.
 *
 * Kept apart from lib/actions/wishlist.ts so a page can resolve saved state
 * during render without pulling a "use server" module into its graph.
 */

/**
 * Whether the signed-in customer has saved this product. Guests always get
 * false -- the wishlist requires an account, and the button prompts for
 * sign-in on click rather than hiding itself.
 */
export async function isProductWishlisted(productId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  try {
    const user = await getSessionUser();
    if (!user) return false;

    const item = await prisma.wishlistItem.findFirst({
      where: { productId, wishlist: { userId: user.id } },
      select: { id: true },
    });
    return Boolean(item);
  } catch {
    // Never let a wishlist lookup break a product page.
    return false;
  }
}
