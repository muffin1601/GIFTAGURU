import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/lead";
import { sendLeadEmails } from "@/lib/email/service";
import { clientKey, consume, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Replaces a hand-rolled Map that was never pruned (one retained entry per
  // client IP, for the life of the process) and that only recorded an attempt
  // AFTER validation passed -- so malformed submissions were unthrottled and a
  // scripted flood of invalid payloads cost nothing. The counter is consumed
  // up front now, before any parsing or database work.
  const limit = consume(await clientKey("leads"), 5, 60_000);
  if (!limit.ok) {
    return tooManyRequests("Please wait a few seconds before submitting again.", limit.retryAfter);
  }

  const payload = await request.json();
  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ message: "Thanks. We received your enquiry." });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ demo: true, message: "Lead validated. DATABASE_URL is not configured." });
  }

  const lead = await prisma.lead.create({
    data: {
      type: parsed.data.type,
      source: parsed.data.source,
      name: parsed.data.name,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      productId: parsed.data.productId || null,
      productName: parsed.data.productName,
      productSlug: parsed.data.productSlug,
      productUrl: parsed.data.productUrl,
      collectionId: parsed.data.collectionId || null,
      collectionName: parsed.data.collectionName,
      quantity: parsed.data.quantity,
      budget: parsed.data.budget,
      totalBudget: parsed.data.totalBudget,
      deliveryDate: parsed.data.deliveryDate ? new Date(parsed.data.deliveryDate) : null,
      deliveryLocation: parsed.data.deliveryLocation,
      brandingRequired: parsed.data.brandingRequired,
      brandingOptions: parsed.data.brandingOptions,
      logoUrl: parsed.data.logoUrl,
      metadata: { requirementType: parsed.data.requirementType ?? null },
    },
  });

  if (parsed.data.type === "bulk_order") {
    await prisma.bulkQuoteRequest.create({
      data: {
        fullName: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        companyName: parsed.data.company,
        productInterest: parsed.data.productName ?? parsed.data.collectionName,
        quantity: parsed.data.quantity ? Number.parseInt(parsed.data.quantity.replace(/\D/g, ""), 10) || undefined : undefined,
        budgetRange: parsed.data.budget,
        occasion: parsed.data.source,
        message: parsed.data.message,
      },
    });
  }

  await sendLeadEmails(lead.id);

  return NextResponse.json({ id: lead.id, message: "Thanks. We received your enquiry." });
}
