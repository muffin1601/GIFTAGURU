import { z } from "zod";

export const bulkQuoteSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  companyName: z.string().trim().max(160).optional(),
  productInterest: z.string().trim().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(1_000_000).optional(),
  budgetRange: z.string().trim().max(60).optional(),
  occasion: z.string().trim().max(120).optional(),
  message: z.string().trim().max(1000).optional(),
});

export type BulkQuoteInput = z.infer<typeof bulkQuoteSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
