import { z } from "zod";
import { addressSchema } from "@/lib/validations/address";

export const checkoutContactSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
});

export const checkoutSchema = z.object({
  contact: checkoutContactSchema,
  shippingAddress: addressSchema,
  giftMessage: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(500).optional(),
  discountCode: z.string().trim().max(40).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
  customization: z
    .object({
      logo_url: z.string().url().optional(),
      personalization_text: z.string().trim().max(200).optional(),
      gift_message: z.string().trim().max(500).optional(),
      gift_wrap: z.boolean().optional(),
    })
    .optional()
    .default({}),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
