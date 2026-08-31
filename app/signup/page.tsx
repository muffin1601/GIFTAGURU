import type { Metadata } from "next";
import AuthForm from "@/components/forms/AuthForm";
import { signupAction } from "@/lib/actions/auth";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Create Account | Gifta Guru",
  description: "Create a Gifta Guru business gifting account for faster checkout and quotes.",
  path: "/signup",
  index: false,
});

export default function SignupPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Create account" subtitle="Create a business gifting account for faster checkout and quotes." action={signupAction} mode="signup" />
    </main>
  );
}
