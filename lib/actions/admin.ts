"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email/service";

const statusFlow = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "ready_to_ship", "cancelled"],
  paid: ["processing", "ready_to_ship", "cancelled", "refunded"],
  processing: ["ready_to_ship", "shipped", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: ["refunded"],
  fulfilled: ["refunded"],
  cancelled: [],
  refunded: [],
} as const;

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "paid", "processing", "ready_to_ship", "shipped", "out_for_delivery", "delivered", "fulfilled", "cancelled", "refunded"]),
  note: z.string().trim().max(1000).optional(),
});

const deliverySchema = z.object({
  orderId: z.string().uuid(),
  deliveryStatus: z.enum(["pending", "ready_to_ship", "shipped", "out_for_delivery", "delivered", "failed", "returned", "cancelled"]),
  courierName: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(160).optional(),
  trackingUrl: z.string().trim().url().optional().or(z.literal("")),
  shippedAt: z.string().optional(),
  estimatedDeliveryAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  deliveryNotes: z.string().trim().max(1000).optional(),
});

export async function updateOrderStatusAction(_state: { error?: string; success?: string }, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = updateOrderStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid status update." };

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return { error: "Order not found." };

  const allowed = statusFlow[order.status] as readonly string[];
  if (order.status !== parsed.data.status && !allowed.includes(parsed.data.status)) {
    return { error: `Cannot change order from ${order.status} to ${parsed.data.status}.` };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: parsed.data.status,
        deliveryStatus: statusToDelivery(parsed.data.status, order.deliveryStatus),
        deliveredAt: parsed.data.status === "delivered" ? new Date() : order.deliveredAt,
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: parsed.data.status,
        fromDeliveryStatus: order.deliveryStatus,
        toDeliveryStatus: statusToDelivery(parsed.data.status, order.deliveryStatus),
        actorId: admin.id,
        note: parsed.data.note,
      },
    }),
  ]);

  await sendOrderStatusEmail(order.id, parsed.data.status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  return { success: "Order status updated." };
}

export async function updateDeliveryAction(_state: { error?: string; success?: string }, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = deliverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid delivery details." };

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return { error: "Order not found." };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryStatus: parsed.data.deliveryStatus,
        courierName: parsed.data.courierName || null,
        trackingNumber: parsed.data.trackingNumber || null,
        trackingUrl: parsed.data.trackingUrl || null,
        shippedAt: parsed.data.shippedAt ? new Date(parsed.data.shippedAt) : null,
        estimatedDeliveryAt: parsed.data.estimatedDeliveryAt ? new Date(parsed.data.estimatedDeliveryAt) : null,
        deliveredAt: parsed.data.deliveredAt ? new Date(parsed.data.deliveredAt) : null,
        deliveryNotes: parsed.data.deliveryNotes || null,
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromDeliveryStatus: order.deliveryStatus,
        toDeliveryStatus: parsed.data.deliveryStatus,
        toStatus: order.status,
        actorId: admin.id,
        note: parsed.data.deliveryNotes,
      },
    }),
  ]);

  await sendOrderStatusEmail(order.id, parsed.data.deliveryStatus);
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  return { success: "Delivery details updated." };
}

export async function updateInventoryAction(_state: { error?: string; success?: string }, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = z.object({
    inventoryId: z.string().uuid(),
    quantityAvailable: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0),
    reason: z.string().trim().max(300).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid inventory update." };

  const inventory = await prisma.inventory.findUnique({ where: { id: parsed.data.inventoryId } });
  if (!inventory) return { error: "Inventory record not found." };

  const quantityChange = parsed.data.quantityAvailable - inventory.quantityAvailable;
  await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantityAvailable: parsed.data.quantityAvailable,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
    }),
    prisma.inventoryAdjustment.create({
      data: {
        inventoryId: inventory.id,
        variantId: inventory.variantId,
        type: "manual",
        quantityChange,
        quantityAfter: parsed.data.quantityAvailable,
        reason: parsed.data.reason,
        actorId: admin.id,
      },
    }),
  ]);

  revalidatePath("/admin/inventory");
  return { success: "Inventory updated." };
}

export async function updateBulkQuoteAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: z.string().uuid(),
    status: z.enum(["new", "contacted", "quoted", "negotiating", "converted", "closed", "won", "lost"]),
    adminNotes: z.string().trim().max(2000).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid enquiry update." };

  await prisma.bulkQuoteRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
  });
  revalidatePath("/admin/bulk-enquiries");
  return { success: "Bulk enquiry updated." };
}

export async function updateLeadAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: z.string().uuid(),
    status: z.enum(["new", "contacted", "qualified", "quoted", "negotiating", "converted", "closed"]),
    adminNotes: z.string().trim().max(2000).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid lead update." };

  await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${parsed.data.id}`);
  return { success: "Lead updated." };
}

export async function updateCustomizationAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: z.string().uuid(),
    status: z.enum(["pending", "in_review", "approved", "rejected", "completed"]),
    adminNotes: z.string().trim().max(2000).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid customization update." };

  await prisma.customizationRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
  });
  revalidatePath("/admin/customizations");
  return { success: "Customization request updated." };
}

export async function createCouponAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
    description: z.string().trim().max(300).optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive(),
    minOrderValue: z.coerce.number().min(0).default(0),
    maxUses: z.coerce.number().int().min(1).optional(),
    perUserLimit: z.coerce.number().int().min(1).optional(),
    expiresAt: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid coupon." };

  await prisma.discount.upsert({
    where: { code: parsed.data.code },
    update: {
      description: parsed.data.description,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderValue: parsed.data.minOrderValue,
      maxUses: parsed.data.maxUses,
      perUserLimit: parsed.data.perUserLimit,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: true,
    },
    create: {
      code: parsed.data.code,
      description: parsed.data.description,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderValue: parsed.data.minOrderValue,
      maxUses: parsed.data.maxUses,
      perUserLimit: parsed.data.perUserLimit,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/coupons");
  return { success: "Coupon saved." };
}

export async function updateStoreSettingsAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const entries = ["store_name", "contact_phone", "whatsapp_number", "support_email", "minimum_quantity", "gift_wrap_price", "shipping_message", "shipping_timeline"];

  await prisma.$transaction(entries.map((key) => {
    const rawValue = String(formData.get(key) ?? "");
    const numeric = ["minimum_quantity", "gift_wrap_price"].includes(key);
    return prisma.storeSetting.upsert({
      where: { key },
      update: { value: numeric ? Number(rawValue) : rawValue },
      create: { key, value: numeric ? Number(rawValue) : rawValue },
    });
  }));

  revalidatePath("/admin/settings");
  return { success: "Store settings updated." };
}

const addPriceTierSchema = z.object({
  productId: z.string().uuid(),
  minQuantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

export async function addPriceTierAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = addPriceTierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid price tier." };

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { basePrice: true, slug: true } });
  if (!product) return { error: "Product not found." };
  if (parsed.data.unitPrice >= Number(product.basePrice)) {
    return { error: "Tier price must be lower than the base price to reward higher quantities." };
  }

  await prisma.productPriceTier.upsert({
    where: { productId_minQuantity: { productId: parsed.data.productId, minQuantity: parsed.data.minQuantity } },
    update: { unitPrice: parsed.data.unitPrice },
    create: { productId: parsed.data.productId, minQuantity: parsed.data.minQuantity, unitPrice: parsed.data.unitPrice },
  });

  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidatePath(`/products/${product.slug}`);
  return { success: "Price tier saved." };
}

const deletePriceTierSchema = z.object({
  tierId: z.string().uuid(),
  productId: z.string().uuid(),
});

export async function deletePriceTierAction(_state: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = deletePriceTierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid price tier." };

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { slug: true } });
  await prisma.productPriceTier.delete({ where: { id: parsed.data.tierId } }).catch(() => null);

  revalidatePath(`/admin/products/${parsed.data.productId}`);
  if (product) revalidatePath(`/products/${product.slug}`);
  return { success: "Price tier removed." };
}

const updateCustomerRoleSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(["customer", "admin", "super_admin"]),
});

export async function updateCustomerRoleAction(
  _state: { error?: string; success?: string },
  formData: FormData,
) {
  const admin = await requireAdmin();
  // Only a super_admin can grant or revoke admin access -- an ordinary admin
  // could otherwise promote themselves or anyone else to super_admin.
  if (admin.role !== "super_admin") {
    return { error: "Only a super admin can change account roles." };
  }

  const parsed = updateCustomerRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid role." };

  if (parsed.data.profileId === admin.id && parsed.data.role !== "super_admin") {
    return { error: "You cannot remove your own super admin access." };
  }

  const target = await prisma.profile.findUnique({ where: { id: parsed.data.profileId } });
  if (!target) return { error: "Account not found." };

  if (target.role === "super_admin" && parsed.data.role !== "super_admin") {
    const remaining = await prisma.profile.count({
      where: { role: "super_admin", id: { not: target.id } },
    });
    if (remaining === 0) {
      return { error: "At least one super admin must remain." };
    }
  }

  await prisma.profile.update({
    where: { id: parsed.data.profileId },
    data: { role: parsed.data.role },
  });

  revalidatePath(`/admin/customers/${parsed.data.profileId}`);
  revalidatePath("/admin/customers");
  return { success: `Role updated to ${parsed.data.role.replaceAll("_", " ")}.` };
}

function statusToDelivery(status: string, fallback: "pending" | "ready_to_ship" | "shipped" | "out_for_delivery" | "delivered" | "failed" | "returned" | "cancelled") {
  if (status === "ready_to_ship") return "ready_to_ship";
  if (status === "shipped") return "shipped";
  if (status === "out_for_delivery") return "out_for_delivery";
  if (status === "delivered" || status === "fulfilled") return "delivered";
  if (status === "cancelled") return "cancelled";
  return fallback;
}
