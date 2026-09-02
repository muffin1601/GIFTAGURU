import { z } from "zod";
import { PERSONALIZATION_MAX_LENGTH } from "@/lib/config/store";

/**
 * Server-side contract for every cart mutation. The client is trusted for
 * *what* to add and *how many* -- never for price, and never for which cart
 * the line belongs to (that is derived from the session in the service).
 */

const uuid = z.string().uuid();

export const customizationSchema = z.object({
  personalizationText: z
    .string()
    .trim()
    .max(PERSONALIZATION_MAX_LENGTH, `Personalization text must be ${PERSONALIZATION_MAX_LENGTH} characters or less.`)
    .optional(),
  logoUrl: z.string().trim().max(2048).optional(),
  logoFileName: z.string().trim().max(255).optional(),
  giftWrap: z.boolean().optional(),
});

export const addToCartSchema = z.object({
  // Product id or slug: the storefront addresses products both ways.
  productRef: z.string().trim().min(1).max(200),
  variantId: uuid.optional(),
  // Upper bound guards against a hostile client inflating a line to an
  // absurd quantity; stock is the real ceiling, applied in the service.
  quantity: z.number().int().positive().max(100_000).optional(),
  customization: customizationSchema.optional(),
});

/**
 * Shape of the abandoned `giftaguru-cart` localStorage payload, imported once
 * per browser. Treated as fully untrusted input: it is attacker-writable, and
 * anything beyond the item reference and quantity (notably `price`) is
 * discarded and recomputed server-side.
 */
export const legacyCartSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(200),
        quantity: z.number().int().positive().max(100_000),
        personalizationText: z.string().trim().max(PERSONALIZATION_MAX_LENGTH).optional(),
        logoUrl: z.string().trim().max(2048).optional(),
        logoFileName: z.string().trim().max(255).optional(),
        giftWrap: z.boolean().optional(),
      }),
    )
    // Bounded so a hand-edited localStorage blob can't drive an unbounded
    // number of writes in one request.
    .max(50),
});

export const lineSchema = z.object({ lineId: uuid });

/** `addressId: null` routes the line back to the order's primary destination. */
export const lineAddressSchema = z.object({
  lineId: uuid,
  addressId: uuid.nullable().optional(),
});

export const lineQuantitySchema = z.object({
  lineId: uuid,
  quantity: z.number().int().min(0).max(100_000),
});

export type AddToCartRequest = z.infer<typeof addToCartSchema>;
