import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { bulkQuoteSchema } from "@/lib/validations/quote";
import { buildWhatsAppUrl } from "@/lib/config/store";
import { sendBulkEnquiryEmail } from "@/lib/email/service";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = bulkQuoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form details." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const whatsappUrl = buildWhatsAppUrl(
    `Hi Gifta Guru, I need a bulk quote. Name: ${data.fullName}. Company: ${data.companyName ?? "N/A"}. Product: ${data.productInterest ?? "N/A"}. Quantity: ${data.quantity ?? "N/A"}.`,
  );

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      message: "Bulk enquiry validated. DATABASE_URL is not configured, so it was not saved.",
      whatsappUrl,
    });
  }

  const enquiry = await prisma.bulkQuoteRequest.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      productInterest: data.productInterest,
      quantity: data.quantity,
      budgetRange: data.budgetRange,
      occasion: data.occasion,
      message: data.message,
    },
  });

  await sendBulkEnquiryEmail(enquiry.id);

  return NextResponse.json({
    id: enquiry.id,
    message: "Bulk enquiry received. Our team will contact you shortly.",
    whatsappUrl,
  });
}
