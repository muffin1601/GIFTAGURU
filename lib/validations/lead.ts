import { z } from "zod";

export const leadSchema = z.object({
  type: z.enum(["general", "contact", "bulk_order", "product", "collection", "customization", "chatbot", "consultation"]).default("general"),
  source: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid work email"),
  phone: z.string().trim().regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
  requirementType: z.string().trim().max(120).optional(),
  productId: z.string().uuid().optional().or(z.literal("")),
  productName: z.string().trim().max(200).optional(),
  productSlug: z.string().trim().max(200).optional(),
  productUrl: z.string().trim().max(500).optional(),
  collectionId: z.string().uuid().optional().or(z.literal("")),
  collectionName: z.string().trim().max(200).optional(),
  quantity: z.string().trim().max(80).optional(),
  budget: z.string().trim().max(120).optional(),
  totalBudget: z.string().trim().max(120).optional(),
  deliveryDate: z.string().optional(),
  deliveryLocation: z.string().trim().max(180).optional(),
  brandingRequired: z.coerce.boolean().default(false),
  brandingOptions: z.array(z.string().trim().max(80)).optional().default([]),
  logoUrl: z.string().trim().max(500).optional(),
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
