import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default("home"),
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(3, "Enter the address").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().max(56).optional().default("IN"),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
