import type { Metadata } from "next";
import AuthForm from "@/components/forms/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Log In | Gifta Guru",
  description: "Log in to your Gifta Guru account to track orders and manage addresses.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Log in" subtitle="Access your Gifta Guru account, addresses, orders, and wishlist." action={loginAction} mode="login" />
    </main>
  );
}
