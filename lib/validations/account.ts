import { z } from "zod";

/**
 * Server-side contracts for the customer account area.
 *
 * Address input is validated identically here and at checkout, so an address
 * that saves cleanly can never be rejected later in the order flow.
 */

const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

const optionalText = (max = 120) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

/** Indian mobile numbers, tolerating +91 / 0 prefixes and spacing. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => /^(?:\+91|0)?[6-9]\d{9}$/.test(value), "Enter a valid 10-digit Indian mobile number");

export const addressSchema = z.object({
  label: z.enum(["home", "office", "other"]).default("home"),
  fullName: requiredText("Full name"),
  phone: phoneSchema,
  line1: requiredText("Address line 1", 200),
  line2: optionalText(200),
  landmark: optionalText(150),
  city: requiredText("City", 80),
  state: requiredText("State", 80),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code"),
  // Only India is served today. Fixed server-side rather than accepted from
  // the client so shipping and GST logic can rely on it.
  country: z.literal("IN").default("IN"),
  isDefault: z.boolean().default(false),
});

export const addressIdSchema = z.object({ id: z.string().uuid() });

export const updateAddressSchema = addressSchema.extend({ id: z.string().uuid() });

export const profileSchema = z.object({
  fullName: requiredText("Full name"),
  // Optional: a personal customer has no company, and requiring one would
  // block them from saving anything else on the form.
  companyName: optionalText(150),
  phone: phoneSchema.optional().or(z.literal("").transform(() => undefined)),
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AddressInput = z.infer<typeof addressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
