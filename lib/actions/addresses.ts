"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfileId } from "@/lib/auth/session";
import { addressIdSchema, addressSchema, updateAddressSchema } from "@/lib/validations/account";
import { logger, errorMessage } from "@/lib/logger";

/**
 * Address book CRUD.
 *
 * Every action re-derives the owning profile from the session and scopes its
 * writes with `profileId`, so passing another customer's address id simply
 * matches zero rows rather than mutating their data.
 */

export type AddressActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

const MAX_ADDRESSES = 20;

function parseForm(formData: FormData) {
  return {
    label: String(formData.get("label") ?? "home"),
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    landmark: String(formData.get("landmark") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: "IN" as const,
    isDefault: formData.get("isDefault") === "on" || formData.get("isDefault") === "true",
  };
}

/** Maps Zod issues onto field names so each input can show its own message. */
function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function createAddressAction(
  _state: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressSchema.safeParse(parseForm(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), error: "Please correct the highlighted fields." };

  try {
    const profileId = await requireProfileId();

    const count = await prisma.address.count({ where: { profileId } });
    if (count >= MAX_ADDRESSES) {
      return { error: `You can save up to ${MAX_ADDRESSES} addresses. Delete one to add another.` };
    }

    // The very first address becomes the default regardless of the checkbox --
    // a customer with addresses but no default would break checkout's
    // pre-selection.
    const shouldBeDefault = parsed.data.isDefault || count === 0;

    await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({ where: { profileId, isDefault: true }, data: { isDefault: false } });
      }
      await tx.address.create({
        data: { ...parsed.data, profileId, isDefault: shouldBeDefault },
      });
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: "Address saved." };
  } catch (error) {
    logger.error("address.create_failed", { message: errorMessage(error) });
    return { error: "We couldn't save that address. Please try again." };
  }
}

export async function updateAddressAction(
  _state: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = updateAddressSchema.safeParse({ ...parseForm(formData), id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), error: "Please correct the highlighted fields." };

  const { id, ...data } = parsed.data;

  try {
    const profileId = await requireProfileId();

    // Ownership check before any write: an id from another account must not
    // reach the update below.
    const owned = await prisma.address.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!owned) return { error: "That address no longer exists." };

    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { profileId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      await tx.address.update({ where: { id }, data });
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: "Address updated." };
  } catch (error) {
    logger.error("address.update_failed", { message: errorMessage(error) });
    return { error: "We couldn't update that address. Please try again." };
  }
}

export async function deleteAddressAction(
  _state: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressIdSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { error: "Invalid request." };

  try {
    const profileId = await requireProfileId();

    const address = await prisma.address.findFirst({
      where: { id: parsed.data.id, profileId },
      select: { id: true, isDefault: true },
    });
    if (!address) return { error: "That address no longer exists." };

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: address.id } });

      // Deleting the default would leave the customer with none, so promote
      // the most recently updated survivor.
      if (address.isDefault) {
        const next = await tx.address.findFirst({
          where: { profileId },
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        });
        if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: "Address deleted." };
  } catch (error) {
    logger.error("address.delete_failed", { message: errorMessage(error) });
    return { error: "We couldn't delete that address. Please try again." };
  }
}

export async function setDefaultAddressAction(
  _state: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressIdSchema.safeParse({ id: String(formData.get("id") ?? "") });
  if (!parsed.success) return { error: "Invalid request." };

  try {
    const profileId = await requireProfileId();

    const owned = await prisma.address.findFirst({ where: { id: parsed.data.id, profileId }, select: { id: true } });
    if (!owned) return { error: "That address no longer exists." };

    // Both writes in one transaction: a failure between them would leave the
    // customer with either two defaults or none.
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { profileId, isDefault: true, NOT: { id: owned.id } },
        data: { isDefault: false },
      }),
      prisma.address.update({ where: { id: owned.id }, data: { isDefault: true } }),
    ]);

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: "Default address updated." };
  } catch (error) {
    logger.error("address.set_default_failed", { message: errorMessage(error) });
    return { error: "We couldn't update your default address. Please try again." };
  }
}
