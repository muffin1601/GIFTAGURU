"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured, isSupabaseConfigured, siteUrl } from "@/lib/env";
import { mapAuthError, type AuthErrorCode } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/redirect";
import { logger, errorMessage } from "@/lib/logger";
import { mergeGuestCartIntoUser } from "@/lib/cart/service";
import { emailOnlySchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import {
  confirmationEmailCooldownRemaining,
  sendSignupConfirmationEmail,
} from "@/lib/email/service";

export type AuthState = {
  error?: string;
  success?: string;
  /** Lets the form render a recovery affordance rather than just printing text. */
  code?: AuthErrorCode;
  /** Echoed back so a resend can be issued without the customer retyping it. */
  email?: string;
};

const NOT_CONFIGURED: AuthState = {
  error: "Sign-in is temporarily unavailable. Please try again shortly.",
  code: "unknown",
};

/**
 * Anti-enumeration copy: shown whether or not the address exists, so the form
 * can't be used to discover which emails have accounts.
 */
const GENERIC_EMAIL_SENT = "If an account exists for that email, we've sent instructions to it.";

/**
 * Destination for a confirmation link.
 *
 * Supabase's verify endpoint marks the address confirmed *before* it redirects
 * here, so the callback does not need to establish a session -- `flow=confirm`
 * tells it to send the customer to the login page with a success notice
 * instead, which is the flow this store wants. `next` rides along so the
 * subsequent login still returns them to wherever they were headed.
 */
function confirmCallbackUrl(next: string): string {
  return `${siteUrl()}/auth/callback?flow=confirm&next=${encodeURIComponent(next)}`;
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    logger.error("auth.login.misconfigured");
    return NOT_CONFIGURED;
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details.", code: "unknown" };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const mapped = mapAuthError(error);
    // Email is intentionally logged for operational triage of failed sign-ins;
    // the password never enters this scope's logging path.
    logger.warn("auth.login.failed", { email, code: mapped.code, status: error.status });
    return { error: mapped.message, code: mapped.code, email };
  }

  // Fold anything added while browsing as a guest into the account's cart
  // before redirecting, so signing in never costs the customer their basket.
  // Never throws -- a merge failure must not block the login.
  if (data.user) await mergeGuestCartIntoUser(data.user.id);

  logger.info("auth.login.succeeded", { email });
  // Outside any try/catch: redirect() signals by throwing.
  redirect(safeNextPath(formData.get("next")));
}

export async function signupAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseAdminConfigured()) {
    logger.error("auth.signup.misconfigured");
    return NOT_CONFIGURED;
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid signup details.", code: "unknown" };
  }

  const { email, password, fullName } = parsed.data;
  const next = safeNextPath(formData.get("next"));
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { full_name: fullName },
      // Routed through /auth/callback rather than straight at a page: see that
      // file for why the hash fragment Supabase returns needs a client render.
      // `flow=confirm` makes it land on the login page with a confirmation
      // notice instead of signing the customer straight in.
      redirectTo: confirmCallbackUrl(next),
    },
  });

  if (error) {
    const mapped = mapAuthError(error);
    logger.warn("auth.signup.failed", { email, code: mapped.code, status: error.status });

    // An existing address is a routine, recoverable state -- not an error the
    // customer should have to interpret. Point them at the two real exits.
    if (mapped.code === "user_already_exists") {
      return {
        error: "An account already exists for this email. Log in instead, or reset your password if you've forgotten it.",
        code: "user_already_exists",
        email,
      };
    }
    return { error: mapped.message, code: mapped.code, email };
  }

  const emailResult = await sendSignupConfirmationEmail(email, data.properties.action_link);

  if (emailResult?.status === "failed") {
    // The account now exists but the customer holds no confirmation link.
    // Previously this was a dead end; surfacing `email_not_confirmed` gives
    // the form its resend affordance so they can recover without support.
    logger.error("auth.signup.confirmation_email_failed", { email });
    return {
      error: "Your account was created, but we couldn't send the confirmation email. Send it again below.",
      code: "email_not_confirmed",
      email,
    };
  }

  logger.info("auth.signup.succeeded", { email });
  return {
    success: `Account created. We've emailed a confirmation link to ${email} -- click it to finish setting up your account.`,
    email,
  };
}

/**
 * Re-issues a confirmation link for an account that exists but is unconfirmed.
 *
 * Uses an admin-generated magic link delivered through Resend rather than
 * `supabase.auth.resend`, so confirmation mail keeps flowing through the one
 * mailer this project actually configures. Verifying a magic link marks the
 * address confirmed and establishes the session, so the customer lands signed
 * in rather than being sent back to the login form.
 */
export async function resendConfirmationAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseAdminConfigured()) {
    logger.error("auth.resend.misconfigured");
    return NOT_CONFIGURED;
  }

  const parsed = emailOnlySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email address.", code: "unknown" };
  }

  const { email } = parsed.data;
  const next = safeNextPath(formData.get("next"));

  const cooldown = await confirmationEmailCooldownRemaining(email);
  if (cooldown > 0) {
    return {
      error: `Please wait ${cooldown} second${cooldown === 1 ? "" : "s"} before requesting another email.`,
      code: "rate_limited",
      email,
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: confirmCallbackUrl(next) },
    });

    if (error) {
      // Includes "user not found". Logged for operators, never differentiated
      // in the response -- see GENERIC_EMAIL_SENT.
      logger.warn("auth.resend.generate_link_failed", { email, code: mapAuthError(error).code });
      return { success: GENERIC_EMAIL_SENT, email };
    }

    const result = await sendSignupConfirmationEmail(email, data.properties.action_link, String(Date.now()));
    if (result?.status === "failed") {
      logger.error("auth.resend.email_failed", { email });
      return { error: "We couldn't send that email right now. Please try again shortly.", code: "unknown", email };
    }

    logger.info("auth.resend.succeeded", { email });
    return { success: GENERIC_EMAIL_SENT, email };
  } catch (error) {
    logger.error("auth.resend.unexpected", { email, message: errorMessage(error) });
    return { error: "We couldn't send that email right now. Please try again shortly.", code: "unknown", email };
  }
}

export async function forgotPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    logger.error("auth.forgot_password.misconfigured");
    return NOT_CONFIGURED;
  }

  const parsed = emailOnlySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address.", code: "unknown" };

  const { email } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Same hash-fragment handoff as signup -- /reset-password calls
    // updateUser() server-side, which needs a session cookie to already
    // exist, so the reset link has to pass through /auth/callback first.
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    const mapped = mapAuthError(error);
    logger.warn("auth.forgot_password.failed", { email, code: mapped.code });
    // Rate limiting is the one case worth surfacing: silently claiming success
    // would leave the customer waiting for mail that was never sent.
    if (mapped.code === "rate_limited") return { error: mapped.message, code: mapped.code, email };
  } else {
    logger.info("auth.forgot_password.requested", { email });
  }

  // Uniform response regardless of whether the address exists.
  return { success: GENERIC_EMAIL_SENT, email };
}

export async function resetPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    logger.error("auth.reset_password.misconfigured");
    return NOT_CONFIGURED;
  }

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password.", code: "unknown" };
  }

  const supabase = await createClient();

  // updateUser() needs the recovery session that /auth/callback established.
  // Checking first turns a cryptic provider error into actionable copy when
  // the link has expired or was already consumed.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    logger.warn("auth.reset_password.no_session");
    return {
      error: "This password reset link has expired or was already used. Request a new one to continue.",
      code: "session_expired",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const mapped = mapAuthError(error);
    logger.warn("auth.reset_password.failed", { userId: userData.user.id, code: mapped.code });
    return { error: mapped.message, code: mapped.code };
  }

  logger.info("auth.reset_password.succeeded", { userId: userData.user.id });
  redirect("/account");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    // `scope: "global"` revokes every refresh token for the user, so signing
    // out cannot leave a stale session alive on another device.
    await supabase.auth.signOut({ scope: "global" });
    logger.info("auth.logout");
  }
  redirect("/");
}
