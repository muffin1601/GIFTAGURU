import { z } from "zod";

export type ProductFeature = { title: string; description: string };
export type ProductSpecification = { label: string; value: string };
export type ProductFaq = { question: string; answer: string };

const featureSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
});

const specificationSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(600),
});

const faqSchema = z.object({
  question: z.string().trim().min(1).max(240),
  answer: z.string().trim().min(1).max(1200),
});

const jsonArray = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") return [];
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, z.array(item).max(max));

export const productContentFormSchema = z.object({
  longDescription: z.string().trim().max(8000).optional(),
  keyFeatures: jsonArray(featureSchema, 20),
  specifications: jsonArray(specificationSchema, 30),
  packageIncludes: jsonArray(z.string().trim().min(1).max(500), 30),
  customizationOptions: jsonArray(z.string().trim().min(1).max(500), 20),
  brandingMethods: jsonArray(z.string().trim().min(1).max(500), 20),
  additionalDetails: jsonArray(specificationSchema, 30),
  faqs: jsonArray(faqSchema, 15),
  seoDescription: z.string().trim().max(500).optional(),
  contentSource: z.string().trim().max(200).optional(),
  sourceUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  lastVerifiedAt: z.string().trim().date().optional().or(z.literal("")),
});

export type ProductContentFormInput = z.infer<typeof productContentFormSchema>;

export function productContentFromFormData(formData: FormData) {
  return productContentFormSchema.safeParse({
    longDescription: formData.get("longDescription"),
    keyFeatures: formData.get("keyFeatures"),
    specifications: formData.get("specifications"),
    packageIncludes: formData.get("packageIncludes"),
    customizationOptions: formData.get("customizationOptions"),
    brandingMethods: formData.get("brandingMethods"),
    additionalDetails: formData.get("additionalDetails"),
    faqs: formData.get("faqs"),
    seoDescription: formData.get("seoDescription"),
    contentSource: formData.get("contentSource"),
    sourceUrl: formData.get("sourceUrl"),
    lastVerifiedAt: formData.get("lastVerifiedAt"),
  });
}

export function asFeatures(value: unknown): ProductFeature[] {
  const parsed = z.array(featureSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asSpecifications(value: unknown): ProductSpecification[] {
  const parsed = z.array(specificationSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asStringItems(value: unknown): string[] {
  const parsed = z.array(z.string().trim().min(1)).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asFaqs(value: unknown): ProductFaq[] {
  const parsed = z.array(faqSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}
