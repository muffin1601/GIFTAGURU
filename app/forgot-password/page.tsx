import type { Metadata } from "next";
import AuthForm from "@/components/forms/AuthForm";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Reset Password | Gifta Guru",
  description: "Request a secure password reset link for your Gifta Guru account.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Reset password" subtitle="Enter your email and we will send secure reset instructions." action={forgotPasswordAction} mode="forgot" />
    </main>
  );
}
