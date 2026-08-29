"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured, isSupabaseConfigured, siteUrl } from "@/lib/env";
import { resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { sendSignupConfirmationEmail } from "@/lib/email/service";

type AuthState = { error?: string; success?: string };

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured yet. Add the keys from .env.example." };
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid login details." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect("/account");
}

export async function signupAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseAdminConfigured()) return { error: "Supabase is not configured yet. Add the keys from .env.example." };
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid signup details." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      redirectTo: `${siteUrl()}/account`,
    },
  });
  if (error) return { error: error.message };

  const emailResult = await sendSignupConfirmationEmail(parsed.data.email, data.properties.action_link);
  if (emailResult?.status === "failed") return { error: "Account created, but the confirmation email failed to send. Contact support." };

  return { success: "Check your email to confirm your account." };
}

export async function forgotPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured yet. Add the keys from .env.example." };
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.SITE_URL ?? "http://localhost:3000"}/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: "Password reset instructions have been sent." };
}

export async function resetPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured yet. Add the keys from .env.example." };
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect("/account");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
