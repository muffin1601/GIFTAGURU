import type { Metadata } from "next";
import AuthForm from "@/components/forms/AuthForm";
import { resetPasswordAction } from "@/lib/actions/auth";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Set New Password | Gifta Guru",
  description: "Choose a new password for your Gifta Guru account.",
  path: "/reset-password",
  index: false,
});

export default function ResetPasswordPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Set new password" subtitle="Choose a new password for your Gifta Guru account." action={resetPasswordAction} mode="reset" />
    </main>
  );
}
