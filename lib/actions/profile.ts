"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfileId, requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema, profileSchema } from "@/lib/validations/account";
import { mapAuthError } from "@/lib/auth/errors";
import { logger, errorMessage } from "@/lib/logger";

export type ProfileActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.issues), error: "Please correct the highlighted fields." };
  }

  try {
    const profileId = await requireProfileId();
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        fullName: parsed.data.fullName,
        companyName: parsed.data.companyName ?? null,
        phone: parsed.data.phone ?? null,
      },
    });

    revalidatePath("/account/profile");
    revalidatePath("/account");
    return { success: "Profile updated." };
  } catch (error) {
    logger.error("profile.update_failed", { message: errorMessage(error) });
    return { error: "We couldn't save your profile. Please try again." };
  }
}

/**
 * Password change for an already-signed-in customer.
 *
 * Note this is NOT the same as the recovery flow: the customer already holds a
 * valid session, so no email round-trip is involved. The account's email is
 * never accepted from the form -- Supabase applies the change to the session's
 * own user.
 */
export async function changePasswordAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = changePasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.issues), error: parsed.error.issues[0]?.message };
  }

  try {
    const user = await requireSessionUser();
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

    if (error) {
      const mapped = mapAuthError(error);
      logger.warn("profile.password_change_failed", { userId: user.id, code: mapped.code });
      return { error: mapped.message };
    }

    logger.info("profile.password_changed", { userId: user.id });
    return { success: "Password updated." };
  } catch (error) {
    logger.error("profile.password_change_error", { message: errorMessage(error) });
    return { error: "We couldn't update your password. Please try again." };
  }
}
